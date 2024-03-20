const connectButton = document.getElementById('connectButton');
const dataContainer = document.getElementById('dataContainer'); // สร้าง Element สำหรับแสดงข้อมูล

async function connectToDevice() {
  try {
    const options = {
      acceptAllDevices: true // อนุญาตให้เชื่อมต่อกับอุปกรณ์ Bluetooth ทุกตัว
      // สามารถเพิ่มตัวกรอง (filter) หากคุณต้องการระบุประเภทของอุปกรณ์ที่ต้องการเชื่อมต่อ
    };

    const device = await navigator.bluetooth.requestDevice(options);
    console.log('Device:', device);

    // เมื่อเชื่อมต่อกับอุปกรณ์สำเร็จแล้ว จะสร้างการเชื่อมต่อ GATT และเริ่มต้นการอ่านค่าจากคุณสมบัติ
    const server = await device.gatt.connect();
    server.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged); // เพิ่มการฟังเหตุการณ์สำหรับการเปลี่ยนแปลงคุณสมบัติ

    // เริ่มต้นการแจ้งเตือนสำหรับทุกคุณสมบัติ
    await server.getPrimaryService('battery_service')
      .then(service => service.getCharacteristics())
      .then(characteristics => {
        for (const characteristic of characteristics) {
          characteristic.startNotifications(); // เริ่มต้นการแจ้งเตือนค่า
        }
      });

  } catch (error) {
    console.error('Bluetooth error:', error);
  }
}

function handleCharacteristicValueChanged(event) {
  const value = event.target.value; // ค่าที่ส่งมาจากอุปกรณ์
  const hexValue = Array.from(new Uint8Array(value.buffer)).map(b => b.toString(16).padStart(2, '0')).join(' '); // แปลงค่าเป็นรหัสฐานสิบหก (hexadecimal)
  const textNode = document.createTextNode(`Received: ${hexValue}\n`); // สร้างโหนดข้อความใหม่
  dataContainer.appendChild(textNode); // เพิ่มโหนดข้อความลงในคอนเทนเนอร์
}

connectButton.addEventListener('click', connectToDevice);
