document.getElementById('startButton').addEventListener('click', function() {
    var ocrLoader = document.querySelector('.ocrloader');
    
    // Add the 'active' class to start the animation
    ocrLoader.classList.add('active');
    
    // Add additional styles after a delay (e.g., 2 seconds)
    setTimeout(function() {
      ocrLoader.classList.remove('active');
      ocrLoader.classList.add('new-styles'); // Add a new class for additional styles
    }, 2000); // Adjust the delay time in milliseconds (2000ms = 2s)
  });