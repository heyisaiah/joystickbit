enum GamepadButton {
    //% block="L"
    BUTTON_L = 2,
    //% block="R" 
    BUTTON_R = 1,
    //% block="left joystick"
    JOYSTICK_L = 4,
    //% block="right joystick"
    JOYSTICK_R = 3,
}

enum ButtonState {
    //% block="pressed"
    PRESSED = 0,
    //% block="released"
    RELEASED = 1,
    //% block="single click"
    SINGLE_CLICK = 3,
    //% block="double click"
    DOUBLE_CLICK = 4,
    //% block="held"
    HELD = 6,
    //% block="not pressed"
    NOT_PRESSED = 8,
}

enum JoystickAxis {
    //% block="X"
    X = 0,
    //% block="Y"
    Y = 1,
}

enum JoystickSide {
    //% block="left"
    LEFT = 0,
    //% block="right"
    RIGHT = 1,
}

enum JoystickPositionLimit {
    //% block="min"
    MIN = 0,
    //% block="max"
    MAX = 1,
}


//% color="#FFA500" weight=10 icon="\uf2c9" block="Gamepad"
//% groups=['Buttons', 'Joystick', 'Vibration']
namespace joystick {
    
    let i2cAddr: number
    let BK: number
    let RS: number
    function setreg(d: number) {
        pins.i2cWriteNumber(i2cAddr, d, NumberFormat.Int8LE)
        basic.pause(1)
    }

    function set(d: number) {
        d = d & 0xF0
        d = d + BK + RS
        setreg(d)
        setreg(d + 4)
        setreg(d)
    }

    function lcdcmd(d: number) {
        RS = 0
        set(d)
        set(d << 4)
    }

    function lcddat(d: number) {
        RS = 1
        set(d)
        set(d << 4)
    }

    function i2cwrite(addr: number, reg: number, value: number) {
        let buf = pins.createBuffer(2)
        buf[0] = reg
        buf[1] = value
        pins.i2cWriteBuffer(addr, buf)
    }

    function i2cwrite1(addr: number, reg: number, value: number ,value1: string) {
        let lengths = value1.length
        let buf = pins.createBuffer(2+lengths)
        //let arr = value1.split('')
        buf[0] = reg 
        buf[1] = value
        let betys = []
        betys = stringToBytes(value1)
        for (let i = 0; i < betys.length; i++) {
            buf[2+i] = betys[i]
        }
        pins.i2cWriteBuffer(addr, buf)
    }
    
    function i2ccmd(addr: number, value: number) {
        let buf = pins.createBuffer(1)
        buf[0] = value
        pins.i2cWriteBuffer(addr, buf)
    }
    
    function i2cread(addr: number, reg: number) {
        pins.i2cWriteNumber(addr, reg, NumberFormat.UInt8BE);
        let val = pins.i2cReadNumber(addr, NumberFormat.UInt8BE);
        return val;
    }

    function stringToBytes (str : string) {  

        
        let ch = 0;
        let st = 0;
        let gm:number[]; 
        gm = [];
        for (let i = 0; i < str.length; i++ ) { 
            ch = str.charCodeAt(i);  
            st = 0 ;                 

           do {  
                st = ( ch & 0xFF );  
                ch = ch >> 8;   
                gm.push(st);        
            }    

            while ( ch );  
            
        }  
        return gm;  
    } 

    const GAMEPAD_I2C_ADDRESS = 0x5A;
    const LEFT_JOYSTICK_X_REG = 0x10;
    const LEFT_JOYSTICK_Y_REG = 0x11;
    const RIGHT_JOYSTICK_X_REG = 0x12;
    const RIGHT_JOYSTICK_Y_REG = 0x13;

    const LEFT_BUTTON_REG = 0x22;
    const RIGHT_BUTTON_REG = 0x23;
    const RIGHT_JOYSTICK_BUTTON_REG = 0x21;
    const LEFT_JOYSTICK_BUTTON_REG = 0x20;

    const RIGHT_BUTTON_ID = 1;
    const LEFT_BUTTON_ID = 2;
    const RIGHT_JOYSTICK_BUTTON_ID = 3;
    const LEFT_JOYSTICK_BUTTON_ID = 4;
    const JOYSTICK_DEADZONE = 8;
    const JOYSTICK_POSITION_MAX = 100;
    const GAMEPAD_BUTTON_EVENT_SOURCE = 3100;
    const JOYSTICK_MOVED_EVENT_SOURCE = 3101;

    let joystickCentersInitialized = false;
    let leftJoystickXCenter = 0;
    let leftJoystickYCenter = 0;
    let rightJoystickXCenter = 0;
    let rightJoystickYCenter = 0;
    let eventMonitorStarted = false;
    let buttonPressedStates = [false, false, false, false, false];
    let joystickMovedStates = [false, false];

    function getButtonStatus(button: number) {
        switch(button) {
            case RIGHT_BUTTON_ID:
                return i2cread(GAMEPAD_I2C_ADDRESS, RIGHT_BUTTON_REG);
            case LEFT_BUTTON_ID:
                return i2cread(GAMEPAD_I2C_ADDRESS, LEFT_BUTTON_REG);
            case RIGHT_JOYSTICK_BUTTON_ID:
                return i2cread(GAMEPAD_I2C_ADDRESS, RIGHT_JOYSTICK_BUTTON_REG);
			case LEFT_JOYSTICK_BUTTON_ID:
				return i2cread(GAMEPAD_I2C_ADDRESS, LEFT_JOYSTICK_BUTTON_REG);
            default:
                return 0xff;
        }
    }

    function initializeJoystickCenters() {
        if (joystickCentersInitialized) {
            return;
        }

        leftJoystickXCenter = i2cread(GAMEPAD_I2C_ADDRESS, LEFT_JOYSTICK_X_REG);
        leftJoystickYCenter = i2cread(GAMEPAD_I2C_ADDRESS, LEFT_JOYSTICK_Y_REG);
        rightJoystickXCenter = i2cread(GAMEPAD_I2C_ADDRESS, RIGHT_JOYSTICK_X_REG);
        rightJoystickYCenter = i2cread(GAMEPAD_I2C_ADDRESS, RIGHT_JOYSTICK_Y_REG);
        joystickCentersInitialized = true;
    }

    function readRawJoystickPosition(side: JoystickSide, axis: JoystickAxis): number {
        if (side == JoystickSide.LEFT) {
            if (axis == JoystickAxis.X) {
                return i2cread(GAMEPAD_I2C_ADDRESS, LEFT_JOYSTICK_X_REG);
            }
            return i2cread(GAMEPAD_I2C_ADDRESS, LEFT_JOYSTICK_Y_REG);
        }

        if (axis == JoystickAxis.X) {
            return i2cread(GAMEPAD_I2C_ADDRESS, RIGHT_JOYSTICK_X_REG);
        }
        return i2cread(GAMEPAD_I2C_ADDRESS, RIGHT_JOYSTICK_Y_REG);
    }

    function getJoystickCenter(side: JoystickSide, axis: JoystickAxis): number {
        if (side == JoystickSide.LEFT) {
            if (axis == JoystickAxis.X) {
                return leftJoystickXCenter;
            }
            return leftJoystickYCenter;
        }

        if (axis == JoystickAxis.X) {
            return rightJoystickXCenter;
        }
        return rightJoystickYCenter;
    }

    function readJoystickPosition(side: JoystickSide, axis: JoystickAxis): number {
        initializeJoystickCenters();

        let delta = readRawJoystickPosition(side, axis) - getJoystickCenter(side, axis);
        if (Math.abs(delta) <= JOYSTICK_DEADZONE) {
            return 0;
        }
        return scaleJoystickPosition(delta, getJoystickCenter(side, axis));
    }

    function scaleJoystickPosition(delta: number, center: number): number {
        if (delta < 0) {
            if (center <= 0) {
                return 0 - JOYSTICK_POSITION_MAX;
            }
            return Math.max(0 - JOYSTICK_POSITION_MAX, Math.round(delta * JOYSTICK_POSITION_MAX / center));
        }

        if (center >= 255) {
            return JOYSTICK_POSITION_MAX;
        }
        return Math.min(JOYSTICK_POSITION_MAX, Math.round(delta * JOYSTICK_POSITION_MAX / (255 - center)));
    }

    function getJoystickPositionLimit(limit: JoystickPositionLimit): number {
        if (limit == JoystickPositionLimit.MIN) {
            return 0 - JOYSTICK_POSITION_MAX;
        }
        return JOYSTICK_POSITION_MAX;
    }

    function isJoystickMoved(side: JoystickSide): boolean {
        return readJoystickPosition(side, JoystickAxis.X) != 0 || readJoystickPosition(side, JoystickAxis.Y) != 0;
    }

    function startEventMonitor(): void {
        if (eventMonitorStarted) {
            return;
        }

        eventMonitorStarted = true;
        control.inBackground(function () {
            while (true) {
                for (let button = 1; button <= 4; button++) {
                    let pressed = getButtonStatus(button) == ButtonState.PRESSED;
                    if (pressed && !buttonPressedStates[button]) {
                        control.raiseEvent(GAMEPAD_BUTTON_EVENT_SOURCE, button);
                    }
                    buttonPressedStates[button] = pressed;
                }

                for (let side = 0; side <= 1; side++) {
                    let moved = isJoystickMoved(side);
                    if (moved && !joystickMovedStates[side]) {
                        control.raiseEvent(JOYSTICK_MOVED_EVENT_SOURCE, side + 1);
                    }
                    joystickMovedStates[side] = moved;
                }

                basic.pause(20);
            }
        });
    }

   /**
    * Dual-joystick gamepad
    */
   //% blockId=onGamepadButtonPressed block="on %button button pressed" group="Buttons"
   //% weight=78
   //% inlineInputMode=inline
   export function onButtonPressed(button: GamepadButton, handler: () => void): void {
       startEventMonitor();
       control.onEvent(GAMEPAD_BUTTON_EVENT_SOURCE, button, handler);
    }

   /**
    * Dual-joystick gamepad
    */
   //% blockId=buttonState block="%button button is %status" group="Buttons"
   //% weight=74
   //% inlineInputMode=inline
   export function buttonState(button: GamepadButton, status: ButtonState): boolean{
       if(getButtonStatus(button) == status){
           return true;
       }
       return false;
    }

    /**
    * Dual-joystick gamepad
    */
   //% blockId=onJoystickMoved block="on %side joystick moved" group="Joystick"
   //% weight=77
   //% inlineInputMode=inline
   export function onJoystickMoved(side: JoystickSide, handler: () => void): void {
       startEventMonitor();
       control.onEvent(JOYSTICK_MOVED_EVENT_SOURCE, side + 1, handler);
    }


    /**
    * Dual-joystick gamepad
    */
   //% blockId=setVibration block="set vibration to %strength" group="Vibration"
   //% strength.min=0 strength.max=255
   //% weight=75
   //% inlineInputMode=inline
    export function setVibration(strength: number): void {
        let vibrationPin = AnalogPin.P1;
        pins.analogWritePin(vibrationPin, pins.map(
			strength,
			0,
			255,
			0,
			1023
			))
    }

    /**
    * Dual-joystick gamepad
    */
   //% blockId=joystickPosition block="%side joystick %axis position" group="Joystick"
   //% weight=76
   //% inlineInputMode=inline
   export function joystickPosition(side: JoystickSide, axis: JoystickAxis): number {
       return readJoystickPosition(side, axis);
   }

   /**
    * Dual-joystick gamepad
    */
   //% blockId=joystickPositionLimit block="joystick %limit position" group="Joystick"
   //% weight=72
   //% inlineInputMode=inline
   export function joystickPositionLimit(limit: JoystickPositionLimit): number {
       return getJoystickPositionLimit(limit);
   }

    /**
    * Dual-joystick gamepad
    */
   //% blockId=calibrateJoystickCenter block="calibrate joystick center" group="Joystick"
   //% weight=71
   export function calibrateJoystickCenter(): void {
       joystickCentersInitialized = false;
       initializeJoystickCenters();
   }
}
