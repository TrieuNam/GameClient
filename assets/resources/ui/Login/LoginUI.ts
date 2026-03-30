import { _decorator, Component, Node, Button } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('LoginUI')
export class LoginUI extends Component {
    @property(Node)
    background: Node | null = null;

    @property(Node)
    logo: Node | null = null;

    @property(Button)
    startButton: Button | null = null;

    start() {
        // Add event listener for the Start Button
        if (this.startButton) {
            this.startButton.node.on('click', this.onStartButtonClick, this);
        }
    }

    onStartButtonClick() {
        console.log('Start Button Clicked');
        // Add logic to transition to the next scene
    }
}