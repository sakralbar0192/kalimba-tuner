import classes from './app.module.scss';

export function App() {
    const rootElement = document.createElement('div');
    const buttonsWrapper = document.createElement('div');
    const frequencyContainer = document.createElement('p');
    const recordButton = document.createElement('button');
    const stopButton = document.createElement('button');

    rootElement.classList.add(classes.root);

    recordButton.textContent = 'Record';
    stopButton.textContent = 'stop';

    buttonsWrapper.append(recordButton, stopButton);

    rootElement.append(buttonsWrapper, frequencyContainer);

    return {rootElement, recordButton, stopButton, frequencyContainer};
}