document.addEventListener('DOMContentLoaded', () => {
    const camera1 = document.getElementById('camera1');
    const camera2 = document.getElementById('camera2');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    
    let streams = [];

    async function getCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            return devices.filter(device => device.kind === 'videoinput');
        } catch (error) {
            console.error('Error getting cameras:', error);
            return [];
        }
    }

    async function startCameras() {
        try {
            const cameras = await getCameras();
            
            if (cameras.length < 2) {
                alert('Please connect at least two cameras to use this application.');
                return;
            }

            // Get the first camera stream
            const stream1 = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: cameras[0].deviceId }
            });
            camera1.srcObject = stream1;
            streams.push(stream1);

            // Get the second camera stream
            const stream2 = await navigator.mediaDevices.getUserMedia({
                video: { deviceId: cameras[1].deviceId }
            });
            camera2.srcObject = stream2;
            streams.push(stream2);

            startButton.disabled = true;
            stopButton.disabled = false;
        } catch (error) {
            console.error('Error starting cameras:', error);
            alert('Error accessing cameras. Please make sure you have granted camera permissions.');
        }
    }

    function stopCameras() {
        streams.forEach(stream => {
            stream.getTracks().forEach(track => track.stop());
        });
        streams = [];
        camera1.srcObject = null;
        camera2.srcObject = null;
        startButton.disabled = false;
        stopButton.disabled = true;
    }

    startButton.addEventListener('click', startCameras);
    stopButton.addEventListener('click', stopCameras);
}); 