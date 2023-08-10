# React-onboard

## Visual UX onboarding & instructional sequencing tool

_Guide users through your UX by using visual cues and element highlighting._<br><sub>React-onboard is lightweight, requires minimal dependencies, and has baked in error catching to guide users through configuration.</sub>_


***There are two imports for this package. Both of them are necessary for the onboarder to run as expected. See below for methods and details on config:***
````
OnboardController - JS class that controls the functionality of the sequencer
OnboardHint - React component that works with the OnboardController to wrap and display your onboarding content.
````
## Get Started
To get started install the package:
```
npm i react-onboard

or

yarn add react-onboard
```

<br/>
Next, you want to import the OnboardController and OnboardHint component

```
import { OnboardController, OnboardHint } from "react-onboard";
```
<br/>

## OnboardHint Component

Setup all of your custom onboarding content using the OnboardHint component to wrap them. The wrapper can contain any kind of content - carousels, images, videos, or plain text instructions.<br/>

<br/>
When deciding where to place your OnboardHint components keep in mind that they need to be a direct child of the parent element you wish to highlight when the sequencer is running.
<br/>
Example:

```
I have two input fields and a button that I want to highlight sequentially:

<div>
   <div> // I'm the parent div! I will highlight when the overlay is active
      <input />
      <OnboardHint />  // My position is relative to my parent div
   </div>

   <div> // I'm the parent div! I will highlight when the overlay is active
      <input />
      <OnboardHint />  // My position is relative to my parent div
   </div>
    
   <div> // I'm the parent div! I will highlight when the overlay is active
      <button>Confirm</button>
      <OnboardHint />  // My position is relative to my parent div
   </div>
</div>
```

<br/>

The OnboardHint component can be used with or without an options passed in.
```
<OnboardHint>
   <div>
      <h1>
         I have no options passed, but thats A okay!
      </h1>
   </div>
</OnboardHint>
```

<br/>
Or you can pass options to alter functionality.
<br />

```
<OnboardHint
   options={{
      highlighting: true,
      timer: 3500,
      position: {
         bottom: "20px",
         right: "20px",
      },
   }},
   classes=[ 'customClassOne', customClassTwo' ]
>
   <div>
      <h1>
         I have the options param!
      </h1>
   </div>
</OnboardHint>
```

<br/>

There are two types on OnboardHint behaviors: timed and confirm

<br/>

Timed OnboardHints will run out of the box.
<br/><br/>
Confirm OnboardHints give you more control since you determine when the sequencer increments. You can force users to acknowledge instructions, or add videos, dialogues, and carousels.
<br/>
When using confirm OnboardHints you can increment the sequencer by calling the toggleConfirmSequence method on the OnboardController.
<br/>

Example:
```
import { OnboardController } from 'react-onboard';
const OC = new OnboardController();
<OnboardHint
   options={{
      type: "confirm",
      position: {
         bottom: "20px", 
         right: "0", 
       },
   }} >
   <button onClick={() => OC.toggleConfirmSequence()}>confirm</button>
   <img src='./someImg.jpg' alt='some image' />
</OnboardHint>
```

<br/>

## OnboardHint Parameters
| Options Parameters | Defaults | Options | Description |
| :--- | :--- | :-- | :--- |
| sequenceOrder  |  Order they appear in the DOM. | Number | Tells onboard controller which order to play the OnboardHints.  |
| hightlighting  |  true<br/>__<sub>boolean required</sub>__ | true / false | Tells onboard to include the parent div when toggling OnboardHints. This causing the parent div to highlight - bringing its Z-index above the overlay. *Overlay is required* |
| type  |  'timed'<br/>__<sub>string required</sub>__ | 'timed' / 'confirm' | Determines if OnboardHint is timed, or confirmation. For confirmation see configuration here. |
| timer  |  2500<br/>__<sub>Requires type 'timed'</sub>__ | Number | Time in millseconds between type 'timed' OnboardHints. |
| position  |  {top: 0,<br/>left: 0}<br/>__<sub>object required</sub>__  | 'px' / '%' /<br/>'em' / 'rem' | positions the OnboardHint relative to it's parent element. |

| Classes Parameters | Defaults | Description |
| :--- | :--- | :--- |
| classes  | [ ] | An array of strings. A way to add custom classes to each OnboardHint. |

## OnboardController

Once you have all of your OnboardHints setup you can initalize and start the sequencer.
<br/><sub>See below for parameters.</sub>
```
  // You can name this whatever you want
  const OC = new OnboardController();

  // Wrap in useEffect to ensure everything has loaded before initializing
  useEffect(() => {
    // You can call this with or without parameters
    // values below are the defaults
    OC.init({
      hasOverlay = true,
      overlayParentWrapper = "body",
      overlayColor = "rgba( 0, 0, 0, .5)",
    }, () => console.log('I'm a callback'));

    // You can call this function where/whenever you want the sequencer to actually begin
    // It does not need to be in a useEffect
    OC.startSequencer();
  }, []);
```
| Methods | Description | 
| :--- | --- |
| init() | Creates the overlay, grabs all OnboardHints, and sorts them |
| startSequencer() | Begins the sequencer if its initialized|
| checkOptionTypes() | Checks that all options passed into the OnboardHint are the correct type. Will throw errors if incorrect types are passed |
| toggleTimedSequence() | Begins a timed OnboardHint sequence |
| toggleConfirmSequence() | Begins a confirmation OnboardHint sequence |
| toggleOverlay() | Toggles the overlay on and off |

| Method Parameters | Defaults | 
| :--- | --- |
| init({overlay, overlayParentWrapper, overlayColor}, callbackFX) | { true, "body", "rgba( 0, 0, 0, .5)" }, null |
| startSequencer() | N/A |
| checkOptionTypes({ }) | { } |
| toggleTimedSequence(sequenceTimer, type, onFinishCallback)` | 2500, 'timed', null |
| toggleConfirmSequence() | N/A |
| toggleOverlay(boolean) | false |

