import { _decorator,__private } from 'cc';

const {  property } = _decorator;
import { Debugger } from 'core/Debugger';


export class SerializableMap<K,V>{
    @property
    protected _keys : K[] = [];
    @property
    protected _values : V[] = []; 

    Get(key:K){
        let idx = this._keys.indexOf(key);
        if(idx >= 0){
            return this._values[idx];
        }
        else{
            return null;
        }
    }

    Has(key:K){
        return this._keys.indexOf(key) >= 0;
    }

    Add(key:K,val:V){
        if(this.Has(key)){
            Debugger.LogError(`Add key more exited:key=${key},value=${val}`,this);
        }
        else
        {
            this._keys.push(key);
            this._values.push(val);
        }
    }
}