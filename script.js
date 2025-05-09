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

    // First request camera permissions to get labeled devices
    async function initCameras() {
        try {
            // First try to get permission to access cameras
            const initialStream = await navigator.mediaDevices.getUserMedia({ video: true });
            
            // Stop the initial stream
            initialStream.getTracks().forEach(track => track.stop());
            
            // Now we can properly enumerate devices with labels
            await getCameras();
        } catch (error) {
            console.error('Error initializing cameras:', error);
            cameraCountDisplay.textContent = 'Error: Please grant camera permission';
            cameraCountDisplay.classList.add('error');
        }
    }

    async function getCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(device => device.kind === 'videoinput');
            
            console.log('Found cameras:', videoDevices);
            cameraCountDisplay.textContent = `Available cameras: ${videoDevices.length}`;
            
            availableCameras = videoDevices;
            
            // Update camera selection dropdowns
            updateCameraSelects(videoDevices);
            
            return videoDevices;
        } catch (error) {
            console.error('Error getting cameras:', error);
            cameraCountDisplay.textContent = 'Error detecting cameras';
            cameraCountDisplay.classList.add('error');
            return [];
        }
    }

    function updateCameraSelects(cameras) {
        // Clear existing options except the first one
        while (camera1Select.options.length > 1) camera1Select.remove(1);
        while (camera2Select.options.length > 1) camera2Select.remove(1);

        // If no cameras found or no permission
        if (cameras.length === 0) {
            camera1Select.innerHTML = '<option value="">No cameras available</option>';
            camera2Select.innerHTML = '<option value="">No cameras available</option>';
            return;
        }

        // Add camera options
        cameras.forEach((camera, index) => {
            // Use a clear device label or fallback to index
            const label = camera.label || `Camera ${index + 1} (unlabeled)`;
            
            const option1 = new Option(label, camera.deviceId);
            const option2 = new Option(label, camera.deviceId);
            
            camera1Select.add(option1);
            camera2Select.add(option2);
            
            // Select first and second cameras by default
            if (index === 0) {
                camera1Select.value = camera.deviceId;
            }
            if (index === 1 && cameras.length > 1) {
                camera2Select.value = camera.deviceId;
            }
        });

        // Log the dropdown contents for debugging
        console.log('Camera 1 dropdown options:', camera1Select.options.length);
        console.log('Camera 2 dropdown options:', camera2Select.options.length);
    }

    async function startCamera(videoElement, deviceId) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    deviceId: {exact: deviceId},
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
            // Get selected camera IDs
            const camera1Id = camera1Select.value;
            const camera2Id = camera2Select.value;

            if (!camera1Id || !camera2Id) {
                alert('Please select cameras for both displays');
                return;
            }

            // Stop any existing streams
            stopCameras();

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
            } else if (error.name === 'OverconstrainedError') {
                alert('The selected camera is no longer available. Please select another camera.');
                // Refresh camera list if a device was disconnected
                getCameras();
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

    // Listen for device changes (new cameras connected/disconnected)
    navigator.mediaDevices.addEventListener('devicechange', async () => {
        console.log('Devices changed, updating camera list');
        await getCameras();
    });

    // Initial camera detection
    initCameras();

    startButton.addEventListener('click', startCameras);
    stopButton.addEventListener('click', stopCameras);
}); 