// 接收端 (Receiver) - 根据正确接线重写

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

// --- 初始化 ---
radio.setGroup(228)
// 启动时，所有电机都关闭
pins.analogWritePin(LIFT_MOTOR_PWM, 0)
pins.analogWritePin(THRUST_MOTOR_PWM, 0)
pins.servoWritePin(STEER_SERVO_PIN, 90)
basic.showIcon(IconNames.Asleep)

// --- 电机控制函数 ---
function controlLiftMotor(state: number) {
    if (state == 1) { // 开启
        // 设置升力风扇方向 (如果反转，交换下面的1和0)
        pins.digitalWritePin(LIFT_MOTOR_IN1, 1)
        pins.digitalWritePin(LIFT_MOTOR_IN2, 0)
        pins.analogWritePin(LIFT_MOTOR_PWM, 800) // 设定一个固定的升力
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
    } else if (name == "drive") { // 【新】接收前进/后退命令
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