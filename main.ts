// 接收端 (Receiver) - 最终版 (适配电机驱动板)

// --- 初始化设置 ---
radio.setGroup(228)

// 关键步骤：根据示范代码，启动电机驱动板的 Standby/Enable 引脚
pins.digitalWritePin(DigitalPin.P14, 1)

// 初始化舵机和电机
pins.servoWritePin(AnalogPin.P4, 90)   // 转向舵机居中
pins.analogWritePin(AnalogPin.P0, 0)  // 升力风扇关闭
pins.analogWritePin(AnalogPin.P1, 0)  // 推进风扇关闭
pins.digitalWritePin(DigitalPin.P12, 0) // 推进风扇方向引脚置零
pins.digitalWritePin(DigitalPin.P13, 0)
basic.showIcon(IconNames.Asleep)

// 定义一个函数来控制推进电机（模仿你的示范代码）
function controlThrustMotor(speed: number) {
    // 设置前进方向。如果电机反转，交换下面的 1 和 0
    pins.digitalWritePin(DigitalPin.P12, 1)
    pins.digitalWritePin(DigitalPin.P13, 0)
    // 设置速度 (0-1023)
    pins.analogWritePin(AnalogPin.P1, speed)
}

// 接收到遥控信号
radio.onReceivedValue(function (name, value) {
    if (name == "lift") {
        if (value == 1) {
            pins.analogWritePin(AnalogPin.P0, 800) // 开启升力，800是示例值，可调
            basic.showIcon(IconNames.Happy)
        } else {
            pins.analogWritePin(AnalogPin.P0, 0)
            basic.showIcon(IconNames.Asleep)
        }
    } else if (name == "thrust") {
        // 使用新函数控制推进电机
        controlThrustMotor(value)
    } else if (name == "steer") {
        pins.servoWritePin(AnalogPin.P4, value)
    } else if (name == "stop") {
        // 紧急停止
        pins.analogWritePin(AnalogPin.P0, 0)  // 停止升力
        controlThrustMotor(0)               // 停止推进
        pins.servoWritePin(AnalogPin.P4, 90) // 方向回正
        basic.showIcon(IconNames.No)
    }
})