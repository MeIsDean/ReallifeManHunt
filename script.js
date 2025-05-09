document.addEventListener('DOMContentLoaded', () => {
    const camera1 = document.getElementById('camera1');
    const camera2 = document.getElementById('camera2');
    const camera1Select = document.getElementById('camera1Select');
    const camera2Select = document.getElementById('camera2Select');
    const startButton = document.getElementById('startButton');
    const stopButton = document.getElementById('stopButton');
    const cameraCountDisplay = document.getElementById('cameraCount');
    
    let stream1 = null;
    let stream2 = null;
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
        // Save current selections
        const camera1Value = camera1Select.value;
        const camera2Value = camera2Select.value;
        
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
        });
        
        // Restore selections if they exist, otherwise select defaults
        if (camera1Value && cameras.some(cam => cam.deviceId === camera1Value)) {
            camera1Select.value = camera1Value;
        } else if (cameras.length > 0) {
            camera1Select.value = cameras[0].deviceId;
        }
        
        if (camera2Value && cameras.some(cam => cam.deviceId === camera2Value)) {
            camera2Select.value = camera2Value;
        } else if (cameras.length > 1) {
            camera2Select.value = cameras[1].deviceId;
        } else if (cameras.length > 0) {
            // If only one camera, use it for both
            camera2Select.value = cameras[0].deviceId;
        }

        console.log('Camera 1 selected:', camera1Select.value);
        console.log('Camera 2 selected:', camera2Select.value);
    }

    async function startCamera(videoElement, deviceId, streamVar) {
        try {
            // Stop previous stream if exists
            if (streamVar) {
                streamVar.getTracks().forEach(track => track.stop());
            }
            
            // Start new stream
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

            // Start cameras sequentially
            // Start camera 1 first
            console.log('Starting camera 1...');
            stream1 = await startCamera(camera1, camera1Id, stream1);
            
            // Small delay before starting camera 2
            console.log('Camera 1 started, waiting before starting camera 2...');
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // Start camera 2
            console.log('Starting camera 2...');
            stream2 = await startCamera(camera2, camera2Id, stream2);
            console.log('Camera 2 started successfully');
            
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
        // Stop camera 1
        if (stream1) {
            stream1.getTracks().forEach(track => track.stop());
            stream1 = null;
            camera1.srcObject = null;
        }
        
        // Stop camera 2
        if (stream2) {
            stream2.getTracks().forEach(track => track.stop());
            stream2 = null;
            camera2.srcObject = null;
        }
        
        startButton.disabled = false;
        stopButton.disabled = true;
        console.log('Cameras stopped');
    }

    // Add event listeners for camera selection changes
    camera1Select.addEventListener('change', async () => {
        try {
            // Only update camera 1, leave camera 2 running
            stream1 = await startCamera(camera1, camera1Select.value, stream1);
            console.log('Camera 1 switched successfully');
        } catch (error) {
            console.error('Error switching camera 1:', error);
            alert('Error switching camera 1');
        }
    });

    camera2Select.addEventListener('change', async () => {
        try {
            // Only update camera 2, leave camera 1 running
            stream2 = await startCamera(camera2, camera2Select.value, stream2);
            console.log('Camera 2 switched successfully');
        } catch (error) {
            console.error('Error switching camera 2:', error);
            alert('Error switching camera 2');
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