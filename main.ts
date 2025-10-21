// 接收端 (Receiver) - 根据正确接线重写 (修正启动逻辑)

// --- 引脚定义 (根据你的描述 A1/A2=升力, B1/B2=推进) ---
// 电机A (Lift Motor - 升力)
const LIFT_MOTOR_PWM = AnalogPin.P1;
const LIFT_MOTOR_IN1 = DigitalPin.P8;
const LIFT_MOTOR_IN2 = DigitalPin.P12;

// 电机B (Thrust Motor - 推进)
const THRUST_MOTOR_PWM = AnalogPin.P2;
const THRUST_MOTOR_IN1 = DigitalPin.P13;
const THRUST_MOTOR_IN2 = DigitalPin.P14;

// 舵机 (Steering Servo)
const STEER_SERVO_PIN = AnalogPin.P4;

// 【关键修正】示范代码中用于启动驱动板的引脚。
// 驱动板通常有一个"Standby"或"Enable"引脚，必须设为高电平才能工作。
// 根据你的示范代码，这个引脚是P14, 但在我们的新接线中，P14被用作电机B的方向控制。
// 通常这类扩展板会有一个专用的、不参与电机控制的引脚做 Standby，或者它可能不需要。
// 但为了保险起见，我们先假设它可能在另一个引脚上，比如 P16。
// 如果加了下面这行还不行，就说明你的板子可能不需要手动Enable，问题在别处。
// 我们先尝试添加一个可能的Enable引脚。
const ENABLE_PIN = DigitalPin.P16; // 这是一个常见的备用引脚，我们先用它尝试


// --- 初始化 ---
radio.setGroup(228)
// 【关键修正】在这里添加启动驱动板的命令
// 如果你的驱动板需要一个Enable信号，就是这行代码。
// 我们暂时用P16尝试，如果你的板子文档有说明，请使用正确的引脚。
pins.digitalWritePin(ENABLE_PIN, 1);


// 启动时，所有电机都关闭
pins.analogWritePin(LIFT_MOTOR_PWM, 0)
pins.analogWritePin(THRUST_MOTOR_PWM, 0)
pins.servoWritePin(STEER_SERVO_PIN, 90)
basic.showIcon(IconNames.Asleep)

// --- 电机控制函数 ---
function controlLiftMotor(state: number) {
    if (state == 1) { // 开启
        pins.digitalWritePin(LIFT_MOTOR_IN1, 1)
        pins.digitalWritePin(LIFT_MOTOR_IN2, 0)
        pins.analogWritePin(LIFT_MOTOR_PWM, 800)
    } else { // 关闭
        pins.analogWritePin(LIFT_MOTOR_PWM, 0)
    }
}

function controlThrustMotor(speed: number) {
    if (speed > 0) { // 前进
        pins.digitalWritePin(THRUST_MOTOR_IN1, 1)
        pins.digitalWritePin(THRUST_MOTOR_IN2, 0)
        pins.analogWritePin(THRUST_MOTOR_PWM, speed)
    } else if (speed < 0) { // 后退
        pins.digitalWritePin(THRUST_MOTOR_IN1, 0)
        pins.digitalWritePin(THRUST_MOTOR_IN2, 1)
        pins.analogWritePin(THRUST_MOTOR_PWM, Math.abs(speed))
    } else { // 停止
        pins.analogWritePin(THRUST_MOTOR_PWM, 0)
    }
}

// --- 接收无线信号 ---
radio.onReceivedValue(function (name, value) {
    if (name == "lift") {
        controlLiftMotor(value)
        if (value == 1) {
            basic.showIcon(IconNames.Happy)
        } else {
            basic.showIcon(IconNames.Asleep)
        }
    } else if (name == "drive") {
        controlThrustMotor(value)
    } else if (name == "steer") {
        pins.servoWritePin(STEER_SERVO_PIN, value)
    } else if (name == "stop") {
        controlLiftMotor(0)
        controlThrustMotor(0)
        pins.servoWritePin(STEER_SERVO_PIN, 90)
        basic.showIcon(IconNames.No)
    }
})