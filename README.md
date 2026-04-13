# joystick:bit

Joystick:bit is a wireless programmable controller for micro:bit, produced by [Shenzhen E-Innovation Space Technology Co., Ltd.](http://www.emakefun.com). It supports both micro:bit V1 and V2.

![image](imgs/61.jpg)

## Features

- Left and right joysticks

- Extends the micro:bit `A` and `B` buttons

- Programmable `L` and `R` buttons

- Built-in vibration motor

- Powered by two AAA batteries

- One PH2.0 4-pin I2C interface

  
  
  

## MakeCode blocks

- `read left/right joystick X/Y`: Reads the current X or Y value from the selected joystick. The result is a number and can be shown on the micro:bit LED display with `show number`.
- `set vibration to ...`: Sets the vibration strength. A value of `0` turns vibration off.
- `button ... is pressed/released/...`: Checks the state of the `L`, `R`, left joystick button, or right joystick button and returns `true` or `false`.
- `L button is ...` and `R button is ...`: Dedicated blocks for the shoulder buttons.

   ![image](imgs/66.jpg)

- The example below does the following:
- After the program is downloaded to the micro:bit, the LED display shows a heart.
- It continuously reads and displays the X-axis value of the left joystick.
- When the `L` button is pressed, the vibration motor turns on.
- When the `L` button is released, the vibration motor turns off.

   ![image](imgs/60.jpg)

### Joystick blocks

- Read the X or Y value from the left or right joystick and display it on the LED matrix.

   ![image](imgs/56.jpg)

   ![image](imgs/69.jpg)

### Button blocks

- Use these blocks to test whether the `L`, `R`, left joystick button, or right joystick button is pressed or released.
- In the example below, pressing the `L` button displays the string `"Hello!"`.

   ![image](imgs/56.jpg)

   ![image](imgs/52.jpg)

- The next examples use the same pattern for the other buttons.

   ![image](imgs/58.jpg)

   ![image](imgs/54.jpg)

### Vibration motor programming graphics block

- The vibration block controls the strength of the built-in vibration motor.

   ![image](imgs/57.jpg)

- In this example, pressing the `L` button starts the vibration motor at strength `137`. Releasing the `L` button stops the motor.

   ![image](imgs/59.jpg)

### Python support

## Open source license
MIT
