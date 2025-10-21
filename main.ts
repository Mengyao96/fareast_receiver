// 接收端 (Receiver) - 专为TRU Components驱动板优化

// --- 电机和舵机引脚定义 ---
// !! 请根据你的实际接线来确认 !!
const LIFT_MOTOR_PIN = AnalogPin.P2;   // 假设升力风扇连接到电机B的速度口
const THRUST_MOTOR_PWM = AnalogPin.P1;   // 推进风扇速度 -> P1
const THRUST_MOTOR_IN1 = DigitalPin.P8;  // 推进风扇方向 -> P8
const THRUST_MOTOR_IN2 = DigitalPin.P12; // 推进风扇方向 -> P12
const STEER_SERVO_PIN = AnalogPin.P4;    // 舵机 -> P4

// --- 初始化 ---
radio.setGroup(228)
// 启动时，所有电机都关闭
pins.analogWritePin(LIFT_MOTOR_PIN, 0)
pins.analogWritePin(THRUST_MOTOR_PWM, 0)
pins.digitalWritePin(THRUST_MOTOR_IN1, 0)
pins.digitalWritePin(THRUST_MOTOR_IN2, 0)
pins.servoWritePin(STEER_SERVO_PIN, 90)
basic.showIcon(IconNames.Asleep)

// --- 电机控制函数 ---
// 控制推进电机
function controlThrustMotor(speed: number) {
    // 设置前进方向 (如果反转，交换下面的1和0)
    pins.digitalWritePin(THRUST_MOTOR_IN1, 1)
    pins.digitalWritePin(THRUST_MOTOR_IN2, 0)
    // 设置速度
    pins.analogWritePin(THRUST_MOTOR_PWM, speed)
}

// --- 接收无线信号 ---
radio.onReceivedValue(function (name, value) {
    if (name == "lift") {
        // 控制升力风扇，value=0为关，value=1为开
        if (value == 1) {
            // 注意：这里我们只控制方向，速度将在下面设定
            pins.digitalWritePin(DigitalPin.P13, 1)
            pins.digitalWritePin(DigitalPin.P14, 0)
            pins.analogWritePin(LIFT_MOTOR_PIN, 800) // 设定一个固定的升力
            basic.showIcon(IconNames.Happy)
        } else {
            pins.analogWritePin(LIFT_MOTOR_PIN, 0) // 直接关闭
            basic.showIcon(IconNames.Asleep)
        }
    } else if (name == "thrust") {
        // 控制推进电机
        controlThrustMotor(value)
    } else if (name == "steer") {
        // 控制舵机
        pins.servoWritePin(STEER_SERVO_PIN, value)
    } else if (name == "stop") {
        // 紧急停止
        pins.analogWritePin(LIFT_MOTOR_PIN, 0)
        controlThrustMotor(0)
        pins.servoWritePin(STEER_SERVO_PIN, 90)
        basic.showIcon(IconNames.No)
    }
})