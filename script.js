document.addEventListener('DOMContentLoaded', () => {
    const camera1 = document.getElementById('camera1');
    const camera2 = document.getElementById('camera2');
    const camera1Select = document.getElementById('camera1Select');
    const camera2Select = document.getElementById('camera2Select');
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
            
            // Update camera selection dropdowns
            updateCameraSelects(videoDevices);
            
            return videoDevices;
        } catch (error) {
            console.error('Error getting cameras:', error);
            cameraCountDisplay.textContent = 'Error detecting cameras';
            return [];
        }
    }

    function updateCameraSelects(cameras) {
        // Clear existing options except the first one
        while (camera1Select.options.length > 1) camera1Select.remove(1);
        while (camera2Select.options.length > 1) camera2Select.remove(1);

        // Add camera options
        cameras.forEach((camera, index) => {
            const label = camera.label || `Camera ${index + 1}`;
            
            const option1 = new Option(label, camera.deviceId);
            const option2 = new Option(label, camera.deviceId);
            
            camera1Select.add(option1);
            camera2Select.add(option2);
        });
    }

    async function startCamera(videoElement, deviceId) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    deviceId: deviceId,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });
            videoElement.srcObject = stream;
            return stream;
        } catch (error) {
            console.error('Error starting camera:', error);
            throw error;
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

            // Stop any existing streams
            stopCameras();

            // Get selected camera IDs
            const camera1Id = camera1Select.value;
            const camera2Id = camera2Select.value;

            if (!camera1Id || !camera2Id) {
                alert('Please select cameras for both displays');
                return;
            }

            // Start both cameras
            const stream1 = await startCamera(camera1, camera1Id);
            const stream2 = await startCamera(camera2, camera2Id);

            streams = [stream1, stream2];
            
            startButton.disabled = true;
            stopButton.disabled = false;
            
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

    // Add event listeners for camera selection changes
    camera1Select.addEventListener('change', async () => {
        if (streams.length > 0) {
            const oldStream = streams[0];
            try {
                const newStream = await startCamera(camera1, camera1Select.value);
                oldStream.getTracks().forEach(track => track.stop());
                streams[0] = newStream;
            } catch (error) {
                console.error('Error switching camera 1:', error);
                alert('Error switching camera 1');
            }
        }
    });

    camera2Select.addEventListener('change', async () => {
        if (streams.length > 1) {
            const oldStream = streams[1];
            try {
                const newStream = await startCamera(camera2, camera2Select.value);
                oldStream.getTracks().forEach(track => track.stop());
                streams[1] = newStream;
            } catch (error) {
                console.error('Error switching camera 2:', error);
                alert('Error switching camera 2');
            }
        }
    });

    // Initial camera detection
    getCameras();

    startButton.addEventListener('click', startCameras);
    stopButton.addEventListener('click', stopCameras);
}); 