document.addEventListener('DOMContentLoaded', () => {
    const camera1 = document.getElementById('camera1');
    const camera2 = document.getElementById('camera2');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const cameraCountDisplay = document.getElementById('cameraCount');
    
    let streams = [];
    let availableCameras = [];

    async function getCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            console.log('Found cameras:', videoDevices);
            cameraCountDisplay.textContent = `Available cameras: ${videoDevices.length}`;
            return videoDevices;
        } catch (error) {
            console.error('Error getting cameras:', error);
            cameraCountDisplay.textContent = 'Error detecting cameras';
            return [];
        }
    }

    async function startCameras() {
        try {
            // First, request camera permissions
            await navigator.mediaDevices.getUserMedia({ video: true });
            
            // Then get the list of cameras
            availableCameras = await getCameras();
            
            if (availableCameras.length < 2) {
                alert(`Found ${availableCameras.length} camera(s). Please connect at least two cameras to use this application.`);
                return;
            }

            // Get the first camera stream
            const stream1 = await navigator.mediaDevices.getUserMedia({
                video: { 
                    deviceId: availableCameras[0].deviceId,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            camera1.srcObject = stream1;
            streams.push(stream1);

            // Get the second camera stream
            const stream2 = await navigator.mediaDevices.getUserMedia({
                video: { 
                    deviceId: availableCameras[1].deviceId,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            camera2.srcObject = stream2;
            streams.push(stream2);

            startButton.disabled = true;
            stopButton.disabled = false;
            
            // Log success
            console.log('Successfully started both cameras');
        } catch (error) {
            console.error('Error starting cameras:', error);
            if (error.name === 'NotAllowedError') {
                alert('Camera access was denied. Please allow camera access and try again.');
            } else if (error.name === 'NotFoundError') {
                alert('No cameras found. Please connect cameras and try again.');
            } else {
                alert(`Error accessing cameras: ${error.message}`);
            }
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
        console.log('Cameras stopped');
    }

    // Initial camera detection
    getCameras();

    startButton.addEventListener('click', startCameras);
    stopButton.addEventListener('click', stopCameras);
}); 