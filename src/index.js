import { App } from "./components/App/app";
import { FrequencyReceiver } from "./modules/FrequencyReceiver";

const constraints = {
   audio: true
}

let documentBody, frequencyReceiver, animationId, visualityTimer, frequencyArray = [];

function calculateQuadraticMean(arrayNumbers) {
   const sumOfItemsSquares = arrayNumbers.reduce((acc, item) => {
      return acc + item**2
   }, 0);

   return Math.sqrt(sumOfItemsSquares/arrayNumbers.length);
}

async function getAudioStream() {
   try {
      return await navigator.mediaDevices.getUserMedia(constraints);
   } catch(err) {
      alert('Something went wrong...');
   }
}

function stopVisualizingFrequency() {
   window.cancelAnimationFrame(animationId);
   clearInterval(visualityTimer)
}

function visualizeFrequency(currentFrequency) {
   if (currentFrequency) {
      frequencyArray.push(currentFrequency);

      const quadraticMean = calculateQuadraticMean(frequencyArray);
      frequencyArray = frequencyArray.slice(-10);
      // console.log(currentFrequency)
      // console.log(frequencyArray)
      console.log(quadraticMean.toFixed(2));
   }
}

async function initializeApp() {
   documentBody = document.body;
   const {rootElement, recordButton, stopButton, frequencyContainer} = App();
   documentBody.appendChild(rootElement);

   frequencyReceiver = new FrequencyReceiver();
   frequencyReceiver.initializeMediaServices(await getAudioStream());

   function onclickHandler() {
      animationId = window.requestAnimationFrame(onclickHandler);
      frequencyReceiver.listening.bind(frequencyReceiver)();
      if (frequencyReceiver.currentFrequency) visualizeFrequency(frequencyReceiver.currentFrequency);      
   }

   recordButton.onclick = () => {
      onclickHandler();
      visualizeFrequency();
   };

   stopButton.onclick = () => {
      stopVisualizingFrequency();
   }
}

document.addEventListener('DOMContentLoaded', initializeApp)