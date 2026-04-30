enum GamepadButton {
    //% block="A"
    BUTTON_A = 5,
    //% block="B"
    BUTTON_B = 6,
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

enum JoystickDirection {
    //% block="any direction"
    ANY = 0,
    //% block="up"
    UP = 1,
    //% block="down"
    DOWN = 2,
    //% block="left"
    LEFT = 3,
    //% block="right"
    RIGHT = 4,
}

/**
 * Haptic vibration patterns for short feedback cues.
 */
enum HapticPattern {
    /**
     * Hold vibration on steadily until the duration ends.
     */
    //% block="steady"
    STEADY = 0,
    /**
     * Play a soft repeating pulse for gentle start, stop, or warning feedback.
     */
    //% block="gentle pulse"
    GENTLE_PULSE = 1,
    /**
     * Play a clear repeating on/off pulse.
     */
    //% block="pulse"
    PULSE = 2,
    /**
     * Play two quick pulses followed by a pause, useful for confirmations.
     */
    //% block="double pulse"
    DOUBLE_PULSE = 3,
    /**
     * Increase vibration strength smoothly over the duration.
     */
    //% block="ramp up"
    RAMP_UP = 4,
    /**
     * Decrease vibration strength smoothly over the duration.
     */
    //% block="ramp down"
    RAMP_DOWN = 5,
    /**
     * Play a repeating rise-and-fall pattern that can follow demo movement.
     */
    //% block="wave"
    WAVE = 6,
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
    const A_BUTTON_ID = 5;
    const B_BUTTON_ID = 6;
    const JOYSTICK_DEADZONE = 8;
    const JOYSTICK_POSITION_MAX = 100;
    const GAMEPAD_BUTTON_EVENT_SOURCE = 3100;
    const GAMEPAD_BUTTON_COMBO_EVENT_SOURCE = 3102;
    const JOYSTICK_TILTED_EVENT_SOURCE = 3101;
    const JOYSTICK_TILTED_CONTINUOUS_EVENT_SOURCE = 3103;
    const VIBRATION_PIN = AnalogPin.P1;
    const BUTTON_CLICK_MAX_MS = 400;
    const BUTTON_DOUBLE_CLICK_MAX_MS = 500;
    const BUTTON_HELD_MS = 700;

    let joystickCentersInitialized = false;
    let leftJoystickXCenter = 0;
    let leftJoystickYCenter = 0;
    let rightJoystickXCenter = 0;
    let rightJoystickYCenter = 0;
    let eventMonitorStarted = false;
    let previousButtonStates = [-1, -1, -1, -1, -1, -1, -1];
    let faceButtonPressedAt = [0, 0, 0, 0, 0, 0, 0];
    let faceButtonLastClickAt = [0, 0, 0, 0, 0, 0, 0];
    let faceButtonHeldRaised = [false, false, false, false, false, false, false];
    let comboPressedStates = [false, false, false, false, false, false, false];
    let joystickTiltedStates = [false, false, false, false, false, false, false, false, false, false];
    let defaultVibrationStrength = 255;
    let vibrationRunId = 0;

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
            case A_BUTTON_ID:
                return input.buttonIsPressed(Button.A) ? ButtonState.PRESSED : ButtonState.RELEASED;
            case B_BUTTON_ID:
                return input.buttonIsPressed(Button.B) ? ButtonState.PRESSED : ButtonState.RELEASED;
            default:
                return 0xff;
        }
    }

    function isFaceButton(button: number): boolean {
        return button == A_BUTTON_ID || button == B_BUTTON_ID;
    }

    function isButtonState(button: number, status: ButtonState): boolean {
        let currentStatus = getButtonStatus(button);
        if (isFaceButton(button) && status == ButtonState.NOT_PRESSED) {
            return currentStatus == ButtonState.RELEASED;
        }
        return currentStatus == status;
    }

    function isButtonPressed(button: number): boolean {
        return getButtonStatus(button) == ButtonState.PRESSED;
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

    function getButtonEventValue(button: number, status: number): number {
        return button * 10 + status;
    }

    function raiseButtonEvent(button: number, status: ButtonState): void {
        control.raiseEvent(GAMEPAD_BUTTON_EVENT_SOURCE, getButtonEventValue(button, status));
    }

    function getComboEventValue(button1: number, button2: number): number {
        let first = Math.min(button1, button2);
        let second = Math.max(button1, button2);
        return first * 10 + second;
    }

    function getJoystickDirectionEventValue(side: JoystickSide, direction: JoystickDirection): number {
        return side * 10 + direction;
    }

    function isJoystickTilted(side: JoystickSide, direction: JoystickDirection): boolean {
        let x = readJoystickPosition(side, JoystickAxis.X);
        let y = readJoystickPosition(side, JoystickAxis.Y);

        if (direction == JoystickDirection.ANY) {
            return x != 0 || y != 0;
        } else if (direction == JoystickDirection.UP) {
            return y < 0 && Math.abs(y) >= Math.abs(x);
        } else if (direction == JoystickDirection.DOWN) {
            return y > 0 && Math.abs(y) >= Math.abs(x);
        } else if (direction == JoystickDirection.LEFT) {
            return x < 0 && Math.abs(x) > Math.abs(y);
        }
        return x > 0 && Math.abs(x) > Math.abs(y);
    }

    function clamp(value: number, min: number, max: number): number {
        return Math.max(min, Math.min(max, value));
    }

    function writeVibration(strength: number): void {
        pins.analogWritePin(VIBRATION_PIN, pins.map(
            clamp(strength, 0, 255),
            0,
            255,
            0,
            1023
        ))
    }

    function pauseHaptic(runId: number, milliseconds: number): boolean {
        let remaining = milliseconds;
        while (remaining > 0) {
            if (runId != vibrationRunId) {
                return false;
            }

            let step = Math.min(20, remaining);
            basic.pause(step);
            remaining = remaining - step;
        }

        return runId == vibrationRunId;
    }

    function playHapticStep(runId: number, strength: number, milliseconds: number): boolean {
        if (runId != vibrationRunId) {
            return false;
        }

        writeVibration(strength);
        return pauseHaptic(runId, milliseconds);
    }

    function playPulsePattern(runId: number, durationMs: number, strength: number, onMs: number, offMs: number): void {
        let remaining = durationMs;
        while (remaining > 0 && runId == vibrationRunId) {
            let onDuration = Math.min(onMs, remaining);
            if (!playHapticStep(runId, strength, onDuration)) {
                return;
            }
            remaining = remaining - onDuration;

            let offDuration = Math.min(offMs, remaining);
            if (offDuration > 0 && !playHapticStep(runId, 0, offDuration)) {
                return;
            }
            remaining = remaining - offDuration;
        }
    }

    function playDoublePulsePattern(runId: number, durationMs: number): void {
        let remaining = durationMs;
        while (remaining > 0 && runId == vibrationRunId) {
            let firstPulse = Math.min(120, remaining);
            if (!playHapticStep(runId, defaultVibrationStrength, firstPulse)) {
                return;
            }
            remaining = remaining - firstPulse;

            let shortGap = Math.min(80, remaining);
            if (shortGap > 0 && !playHapticStep(runId, 0, shortGap)) {
                return;
            }
            remaining = remaining - shortGap;

            let secondPulse = Math.min(120, remaining);
            if (secondPulse > 0 && !playHapticStep(runId, defaultVibrationStrength, secondPulse)) {
                return;
            }
            remaining = remaining - secondPulse;

            let longGap = Math.min(450, remaining);
            if (longGap > 0 && !playHapticStep(runId, 0, longGap)) {
                return;
            }
            remaining = remaining - longGap;
        }
    }

    function playRampPattern(runId: number, durationMs: number, rampUp: boolean): void {
        let steps = Math.max(1, Math.min(20, Math.floor(durationMs / 20)));
        let stepDuration = durationMs / steps;

        for (let step = 0; step < steps; step++) {
            let progress = rampUp ? step + 1 : steps - step;
            let strength = Math.round(defaultVibrationStrength * progress / steps);
            if (!playHapticStep(runId, strength, stepDuration)) {
                return;
            }
        }
    }

    function playWavePattern(runId: number, durationMs: number): void {
        let remaining = durationMs;
        let step = 0;
        while (remaining > 0 && runId == vibrationRunId) {
            let phase = step % 4;
            let strength = defaultVibrationStrength;
            if (phase == 0) {
                strength = Math.round(defaultVibrationStrength * 0.35);
            } else if (phase == 1) {
                strength = Math.round(defaultVibrationStrength * 0.7);
            } else if (phase == 3) {
                strength = Math.round(defaultVibrationStrength * 0.5);
            }

            let duration = Math.min(180, remaining);
            if (!playHapticStep(runId, strength, duration)) {
                return;
            }
            remaining = remaining - duration;

            let gap = Math.min(60, remaining);
            if (gap > 0 && !playHapticStep(runId, 0, gap)) {
                return;
            }
            remaining = remaining - gap;
            step = step + 1;
        }
    }

    function finishHaptic(runId: number): void {
        if (runId == vibrationRunId) {
            writeVibration(0);
        }
    }

    function startEventMonitor(): void {
        if (eventMonitorStarted) {
            return;
        }

        eventMonitorStarted = true;
        control.inBackground(function () {
            while (true) {
                let now = input.runningTime();
                for (let button = 1; button <= 6; button++) {
                    let status = getButtonStatus(button);
                    if (previousButtonStates[button] == -1) {
                        previousButtonStates[button] = status;
                        if (isFaceButton(button) && status == ButtonState.PRESSED) {
                            faceButtonPressedAt[button] = now;
                        }
                    } else if (status != previousButtonStates[button]) {
                        raiseButtonEvent(button, status);
                        if (isFaceButton(button) && status == ButtonState.RELEASED) {
                            raiseButtonEvent(button, ButtonState.NOT_PRESSED);

                            let pressDuration = now - faceButtonPressedAt[button];
                            if (pressDuration <= BUTTON_CLICK_MAX_MS) {
                                if (faceButtonLastClickAt[button] > 0 && now - faceButtonLastClickAt[button] <= BUTTON_DOUBLE_CLICK_MAX_MS) {
                                    raiseButtonEvent(button, ButtonState.DOUBLE_CLICK);
                                    faceButtonLastClickAt[button] = 0;
                                } else {
                                    raiseButtonEvent(button, ButtonState.SINGLE_CLICK);
                                    faceButtonLastClickAt[button] = now;
                                }
                            }
                        } else if (isFaceButton(button) && status == ButtonState.PRESSED) {
                            faceButtonPressedAt[button] = now;
                            faceButtonHeldRaised[button] = false;
                        }
                        previousButtonStates[button] = status;
                    } else if (isFaceButton(button) && status == ButtonState.PRESSED && !faceButtonHeldRaised[button] && now - faceButtonPressedAt[button] >= BUTTON_HELD_MS) {
                        raiseButtonEvent(button, ButtonState.HELD);
                        faceButtonHeldRaised[button] = true;
                    }
                }

                for (let button1 = 1; button1 <= 6; button1++) {
                    for (let button2 = button1 + 1; button2 <= 6; button2++) {
                        let comboValue = getComboEventValue(button1, button2);
                        let comboPressed = isButtonPressed(button1) && isButtonPressed(button2);
                        if (comboPressed && !comboPressedStates[comboValue]) {
                            control.raiseEvent(GAMEPAD_BUTTON_COMBO_EVENT_SOURCE, comboValue);
                        }
                        comboPressedStates[comboValue] = comboPressed;
                    }
                }

                for (let side = 0; side <= 1; side++) {
                    for (let direction = 0; direction <= 4; direction++) {
                        let eventValue = getJoystickDirectionEventValue(side, direction);
                        let tilted = isJoystickTilted(side, direction);
                        if (tilted && !joystickTiltedStates[eventValue]) {
                            control.raiseEvent(JOYSTICK_TILTED_EVENT_SOURCE, eventValue);
                        }
                        if (tilted) {
                            control.raiseEvent(JOYSTICK_TILTED_CONTINUOUS_EVENT_SOURCE, eventValue);
                        }
                        joystickTiltedStates[eventValue] = tilted;
                    }
                }

                basic.pause(20);
            }
        });
    }

   /**
    * Run code when a gamepad button changes to the selected input state.
    * @param button button to watch
    * @param status input state that triggers the event
    */
   //% blockId=onGamepadButtonInput block="on %button button %status" group="Buttons"
   //% weight=78
   //% inlineInputMode=inline
   export function onButtonInput(button: GamepadButton, status: ButtonState, handler: () => void): void {
       startEventMonitor();
       control.onEvent(GAMEPAD_BUTTON_EVENT_SOURCE, getButtonEventValue(button, status), handler);
    }

   /**
    * Run code when both selected gamepad buttons are pressed at the same time.
    * @param button1 first button to watch
    * @param button2 second button to watch
    */
   //% blockId=onGamepadButtonComboPressed block="on %button1 + %button2 buttons pressed" group="Buttons"
   //% weight=77
   //% inlineInputMode=inline
   export function onButtonComboPressed(button1: GamepadButton, button2: GamepadButton, handler: () => void): void {
       startEventMonitor();
       control.onEvent(GAMEPAD_BUTTON_COMBO_EVENT_SOURCE, getComboEventValue(button1, button2), handler);
    }

   /**
    * Check whether a gamepad button is currently in the selected state.
    * @param button button to read
    * @param status input state to compare against
    */
   //% blockId=buttonState block="%button button is %status" group="Buttons"
   //% weight=74
   //% inlineInputMode=inline
   export function buttonState(button: GamepadButton, status: ButtonState): boolean{
       if(isButtonState(button, status)){
           return true;
       }
       return false;
    }

   /**
    * Check whether both selected gamepad buttons are currently pressed.
    * @param button1 first button to read
    * @param button2 second button to read
    */
   //% blockId=buttonComboState block="%button1 + %button2 buttons are pressed" group="Buttons"
   //% weight=73
   //% inlineInputMode=inline
   export function buttonComboState(button1: GamepadButton, button2: GamepadButton): boolean {
       return isButtonPressed(button1) && isButtonPressed(button2);
    }

    /**
    * Run code once when the selected joystick tilts from center toward a direction.
    * @param side joystick to watch
    * @param direction direction to watch
    */
   //% blockId=onJoystickTilted block="on %side joystick tilted %direction" group="Joystick"
   //% weight=77
   //% inlineInputMode=inline
   export function onJoystickTilted(side: JoystickSide, direction: JoystickDirection, handler: () => void): void {
       startEventMonitor();
       control.onEvent(JOYSTICK_TILTED_EVENT_SOURCE, getJoystickDirectionEventValue(side, direction), handler);
    }

    /**
    * Run code repeatedly while the selected joystick is tilted toward a direction.
    * @param side joystick to watch
    * @param direction direction to watch
    */
   //% blockId=whileJoystickTilted block="when %side joystick is tilted %direction" group="Joystick"
   //% weight=76
   //% inlineInputMode=inline
   export function whileJoystickTilted(side: JoystickSide, direction: JoystickDirection, handler: () => void): void {
       startEventMonitor();
       control.onEvent(JOYSTICK_TILTED_CONTINUOUS_EVENT_SOURCE, getJoystickDirectionEventValue(side, direction), handler);
    }

    /**
    * Check whether the selected joystick is tilted toward a direction.
    * @param side joystick to read
    * @param direction direction to check
    */
   //% blockId=joystickTilted block="%side joystick is tilted %direction" group="Joystick"
   //% weight=75
   //% inlineInputMode=inline
   export function joystickTilted(side: JoystickSide, direction: JoystickDirection): boolean {
       return isJoystickTilted(side, direction);
    }


    /**
    * Set the default vibration strength used by haptic patterns.
    * @param strength vibration strength from 0 to 255
    */
   //% blockId=setVibration block="set vibration to %strength" group="Vibration"
   //% strength.min=0 strength.max=255
   //% weight=75
   //% inlineInputMode=inline
    export function setVibration(strength: number): void {
        defaultVibrationStrength = clamp(strength, 0, 255);
    }

   /**
    * Play the selected haptic pattern for a fixed number of seconds.
    * @param pattern haptic pattern to play
    * @param seconds duration from 0 to 60 seconds
    */
   //% blockId=playHaptic block="play haptic %pattern for %seconds seconds" group="Vibration"
   //% seconds.min=0 seconds.max=60
   //% weight=74
   //% inlineInputMode=inline
    export function playHaptic(pattern: HapticPattern, seconds: number): void {
        let durationMs = Math.round(clamp(seconds, 0, 60) * 1000);
        vibrationRunId = vibrationRunId + 1;
        let runId = vibrationRunId;

        if (durationMs <= 0) {
            finishHaptic(runId);
            return;
        }

        if (pattern == HapticPattern.STEADY) {
            playHapticStep(runId, defaultVibrationStrength, durationMs);
        } else if (pattern == HapticPattern.GENTLE_PULSE) {
            playPulsePattern(runId, durationMs, Math.round(defaultVibrationStrength * 0.45), 180, 320);
        } else if (pattern == HapticPattern.PULSE) {
            playPulsePattern(runId, durationMs, defaultVibrationStrength, 150, 150);
        } else if (pattern == HapticPattern.DOUBLE_PULSE) {
            playDoublePulsePattern(runId, durationMs);
        } else if (pattern == HapticPattern.RAMP_UP) {
            playRampPattern(runId, durationMs, true);
        } else if (pattern == HapticPattern.RAMP_DOWN) {
            playRampPattern(runId, durationMs, false);
        } else {
            playWavePattern(runId, durationMs);
        }

        finishHaptic(runId);
    }

    /**
    * Stop any active vibration or haptic pattern immediately.
    */
   //% blockId=stopAllVibration block="stop all vibration" group="Vibration"
   //% weight=73
    export function stopAllVibration(): void {
        vibrationRunId = vibrationRunId + 1;
        writeVibration(0);
    }

    /**
    * Read a joystick axis position from -100 to 100, with 0 at center.
    * @param side joystick to read
    * @param axis axis to read
    */
   //% blockId=joystickPosition block="%side joystick %axis position" group="Joystick"
   //% weight=74
   //% inlineInputMode=inline
   export function joystickPosition(side: JoystickSide, axis: JoystickAxis): number {
       return readJoystickPosition(side, axis);
   }

   /**
    * Get the minimum or maximum joystick position value.
    * @param limit minimum or maximum value to return
    */
   //% blockId=joystickPositionLimit block="joystick %limit position" group="Joystick"
   //% weight=73
   //% inlineInputMode=inline
   export function joystickPositionLimit(limit: JoystickPositionLimit): number {
       return getJoystickPositionLimit(limit);
   }

    /**
    * Recalibrate the joystick center positions using the current joystick readings.
    */
   //% blockId=calibrateJoystickCenter block="calibrate joystick center" group="Joystick"
   //% weight=72
   export function calibrateJoystickCenter(): void {
       joystickCentersInitialized = false;
       initializeJoystickCenters();
   }
}
