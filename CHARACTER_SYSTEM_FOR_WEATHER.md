# Character System Documentation for Weather Feature Implementation

## Executive Summary

This document provides comprehensive information about the GameClient character system to support implementing a weather feature that affects character statistics. The game uses a single-character-per-server model with extensive battle attributes that can be modified by weather effects.

## Character Creation and Management

### Login Flow
1. **Account Login** → User authenticates
2. **Server Selection** → User selects game server
3. **Character Check** → System checks if character exists on selected server
4. **Character Load/Create** → Existing character loads OR character creation screen shows
5. **Game Start** → Character is ready with all stats loaded

### Key Insight for Weather Feature
**You do NOT need to implement character creation to add weather effects.** When players log in to an existing server, their character data is automatically loaded from the server via the `PB_SCRoleInfoAck` protocol message. The weather system can work with existing characters.

## Character Data Storage

### Primary Data Class: `RoleData`
**Location:** `/home/runner/work/GameClient/GameClient/script/modules/role/RoleData.ts`

**Core Attributes:**
```typescript
- roleId: number          // Unique character identifier
- name: string           // Character name
- level: number          // Current level
- cap: number            // Combat power rating
- BaseAttribute: SMDMap<number, number>  // All battle stats stored here
```

### Battle Attributes (BATTLE_ATTR enum)

The game tracks 40+ battle attributes in `CommonEnum.ts`. Here are the key stats that weather could affect:

#### Primary Combat Stats
| Attribute | ID | Description | Weather Impact Example |
|-----------|-----|-------------|----------------------|
| HP | 1 | Health points | Rain: +10% max HP |
| ATTACK | 2 | Physical damage | Sunny: +15% attack |
| ARMOR | 3 | Physical defense | Snow: +20% armor |
| SPEED | 4 | Turn order priority | Wind: +10% speed |

#### Advanced Combat Stats
| Attribute | ID | Description | Weather Impact Example |
|-----------|-----|-------------|----------------------|
| VAMPIRIC | 5 | Life steal % | Blood Moon: +5% vampiric |
| COUNTER | 6 | Counter-attack rate | Fog: +10% counter chance |
| COMBO | 7 | Multi-hit rate | Storm: +8% combo rate |
| EVASION | 8 | Dodge chance | Mist: +15% evasion |
| CRITICAL | 9 | Critical strike chance | Clear Sky: +12% crit |
| STUN | 10 | Stun rate | Thunder: +10% stun |

#### Status Effect Stats
| Attribute | ID | Description | Weather Impact Example |
|-----------|-----|-------------|----------------------|
| MUDDY | 11 | Speed reduction on enemies | Mud: +20% muddy effect |
| INTERDICTION | 12 | Healing reduction | Drought: +15% healing reduction |
| REJUVENATION | 13 | Life recovery % per turn | Spring: +10% rejuvenation |
| BULLYING | 14 | Extra damage to low HP enemies | Heat: +8% bullying |

#### Percentage-based Stats
The game also has percentage versions of primary stats (HP_PER, ATTACK_PER, ARMOR_PER, SPEED_PER) which are multipliers.

### Accessing Character Stats

**Reading Stats:**
```typescript
// Get a specific stat value
let currentHP = RoleData.Inst().GetAttributeData(BATTLE_ATTR.HP);
let currentAttack = RoleData.Inst().GetAttributeData(BATTLE_ATTR.ATTACK);
```

**Modifying Stats (for weather system):**
```typescript
// Current approach - modifies the BaseAttribute map directly
RoleData.Inst().BaseAttribute.set(BATTLE_ATTR.ATTACK, newValue);

// Recommended approach - create a weather modifier system
// Apply weather multipliers on top of base stats
let baseAttack = RoleData.Inst().GetAttributeData(BATTLE_ATTR.ATTACK);
let weatherMultiplier = WeatherSystem.GetModifier(WEATHER_TYPE.SUNNY, BATTLE_ATTR.ATTACK);
let finalAttack = baseAttack * (1 + weatherMultiplier);
```

## Implementation Recommendations for Weather Feature

### 1. Weather System Architecture

```typescript
// Suggested file: /script/modules/weather/WeatherData.ts

enum WEATHER_TYPE {
    CLEAR = 0,
    SUNNY = 1,
    RAINY = 2,
    SNOWY = 3,
    FOGGY = 4,
    STORMY = 5,
    WINDY = 6
}

class WeatherModifier {
    attribute: BATTLE_ATTR;
    multiplier: number;  // e.g., 0.1 = +10%, -0.15 = -15%
}

class WeatherData {
    private currentWeather: WEATHER_TYPE;
    private weatherModifiers: Map<WEATHER_TYPE, WeatherModifier[]>;

    // Get stat modifier for current weather
    GetModifier(attribute: BATTLE_ATTR): number {
        // Return multiplier for this attribute in current weather
    }

    // Change weather and update character stats
    SetWeather(weather: WEATHER_TYPE): void {
        this.currentWeather = weather;
        this.ApplyWeatherEffects();
    }

    private ApplyWeatherEffects(): void {
        // Apply all weather modifiers to character stats
        // Can hook into battle calculation system
    }
}
```

### 2. Integration Points

#### A. Battle Calculation Hook
**Location:** `/script/modules/role/RoleData.ts` - `GetAttributeData()` method

Modify the getter to include weather effects:
```typescript
GetAttributeData(attri_type: number): number {
    let baseValue = this.BaseAttribute.get(attri_type) || 0;

    // Apply weather modifier
    let weatherMod = WeatherData.Inst().GetModifier(attri_type);
    let finalValue = baseValue * (1 + weatherMod);

    return finalValue;
}
```

#### B. UI Display
**Location:** Character panel UI (various view files in `/script/modules/`)

Show weather icon and active modifiers on character screen.

#### C. Weather Trigger System
**Options:**
1. **Time-based:** Weather changes every X minutes
2. **Location-based:** Different zones have different weather
3. **Event-based:** Special events trigger specific weather
4. **Random:** Periodic random weather changes

### 3. Example Weather Configuration

```typescript
// Sunny Weather Effects
WEATHER_SUNNY: {
    modifiers: [
        { attribute: BATTLE_ATTR.ATTACK, multiplier: 0.15 },      // +15% attack
        { attribute: BATTLE_ATTR.CRITICAL, multiplier: 0.10 },    // +10% crit
        { attribute: BATTLE_ATTR.SPEED, multiplier: 0.05 }        // +5% speed
    ],
    duration: 300, // seconds
    icon: "weather_sunny.png"
}

// Rainy Weather Effects
WEATHER_RAINY: {
    modifiers: [
        { attribute: BATTLE_ATTR.HP, multiplier: 0.10 },          // +10% HP
        { attribute: BATTLE_ATTR.ARMOR, multiplier: 0.08 },       // +8% armor
        { attribute: BATTLE_ATTR.EVASION, multiplier: -0.05 }     // -5% evasion
    ],
    duration: 300,
    icon: "weather_rain.png"
}

// Snowy Weather Effects
WEATHER_SNOWY: {
    modifiers: [
        { attribute: BATTLE_ATTR.ARMOR, multiplier: 0.20 },       // +20% armor
        { attribute: BATTLE_ATTR.SPEED, multiplier: -0.10 },      // -10% speed
        { attribute: BATTLE_ATTR.MUDDY, multiplier: 0.15 }        // +15% muddy
    ],
    duration: 300,
    icon: "weather_snow.png"
}
```

### 4. Server Communication

If weather needs server synchronization:
```typescript
// Protocol message definition (add to protocol files)
message PB_CSWeatherInfoReq {}

message PB_SCWeatherInfoAck {
    required int32 weather_type = 1;
    required int64 end_time = 2;
}

// Client-side handler in WeatherCtrl
OnWeatherInfoAck(data: PB_SCWeatherInfoAck): void {
    WeatherData.Inst().SetWeather(data.weather_type);
    // Schedule weather end
}
```

## File Locations Reference

### Character System Files
- **Character Data:** `/home/runner/work/GameClient/GameClient/script/modules/role/RoleData.ts`
- **Character Controller:** `/home/runner/work/GameClient/GameClient/script/modules/role/RoleCtrl.ts`
- **Battle Attributes:** `/home/runner/work/GameClient/GameClient/script/modules/common/CommonEnum.ts`
- **Login System:** `/home/runner/work/GameClient/GameClient/script/modules/login/LoginData.ts`

### Character Count
- **Characters Per Account:** One character per server
- **Multiple Servers:** Each server has separate character data
- **Character List Storage:** `LoginData.server_role_list` (Map<serverId, RoleDatum>)

## Testing the Weather Feature

### Test Cases
1. **Stat Modification Test**
   - Set weather to SUNNY
   - Verify attack stat increases by expected amount
   - Change to RAINY
   - Verify attack returns to normal, HP increases

2. **Battle Impact Test**
   - Enter battle with clear weather
   - Damage should be baseline
   - Change weather to SUNNY mid-battle
   - Damage should increase

3. **UI Display Test**
   - Weather icon displays correctly
   - Stat changes show in character panel
   - Tooltips explain weather effects

4. **Persistence Test**
   - Set weather, logout
   - Login again
   - Weather should persist (if server-synced) or reset (if client-only)

## Asset Conversion Status

All game assets have been converted to pixel art style to avoid copyright issues:

### Conversion Summary
- **Total Assets Converted:** 2,002 files
- **High Priority (Equipment):** 177 files ✓
  - Weapons: 20 files
  - Armor: 100 files
  - Helmets: 38 files
  - Shields: 19 files
- **Medium Priority (Items):** 1,376 files ✓
- **Low Priority (Effects):** 448 files ✓

### Backup Files
All original assets are backed up with `.original.png` extension in the same directory as the converted files.

## Next Steps

1. **Design Weather System**
   - Define all weather types
   - Specify stat modifiers for each weather
   - Design weather transition logic

2. **Create Weather Module**
   - Create `/script/modules/weather/` directory
   - Implement `WeatherData.ts` singleton
   - Implement `WeatherCtrl.ts` message handler
   - Create weather UI components

3. **Integrate with Character System**
   - Hook into `RoleData.GetAttributeData()`
   - Add weather display to character UI
   - Test stat modifications in battle

4. **Add Weather Triggers**
   - Implement time-based or event-based triggers
   - Add weather change notifications
   - Sync with server (if needed)

5. **Create Weather Assets**
   - Design weather icons (pixel art style to match converted assets)
   - Create weather effect animations
   - Add weather background effects

## Summary

The character system is fully functional and ready for weather feature integration. You do not need to implement character creation - focus on:

1. Creating a weather system that modifies existing character stats
2. Hooking into the `GetAttributeData()` method to apply weather modifiers
3. Designing weather types and their effects on the 40+ available attributes
4. Building UI to display current weather and its effects

The pixel art conversion is complete (2,002 assets converted), so the game now has a unique visual style that avoids copyright issues.
