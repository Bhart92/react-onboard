import React from "react";

import "./index.css";
class OnboardController {
  constructor(
    initialized = false,
    hintElements = [],
    isRunning = false,
    hasBackground = true,
    backgroundElement = null,
    currentHintType = "timed",
    onboardingHintTarget = "onboard-hint",

    currIndex = 0,
    finalIndex = null,
    onFinishCallback = null
  ) {
    this.initialized = initialized;
    this.onboardingHintTarget = onboardingHintTarget;
    this.hintElements = hintElements;
    this.isRunning = isRunning;
    this.hasBackground = hasBackground;
    this.backgroundElement = backgroundElement;
    this.currentHintType = currentHintType;
    this.currIndex = currIndex;
    this.finalIndex = finalIndex;
    this.onFinishCallback = onFinishCallback;
  }
  init(
    {
      hasBackground = true,
      backgroundParentWrapper = "body",
      backgroundColor = "rgba( 0, 0, 0, .5)",
    } = {},
    onFinishCallback = null
  ) {
    return new Promise((resolve) => {
      if (onFinishCallback) this.onFinishCallback = onFinishCallback;
      // if background is false then update value
      if (!hasBackground) this.hasBackground = hasBackground;

      if (
        this.hasBackground &&
        !document.querySelector(".onboard-background")
      ) {
        // create div
        const background = document.createElement("div");

        // add background color
        background.style.background = backgroundColor;

        // add appropriate background classes
        background.classList.add("onboard-background", "inactive");

        // attach to direct parent element - can be changed by object passed into init func
        document.querySelector(backgroundParentWrapper).appendChild(background);

        // save background to obj
        this.backgroundElement = background;
      }

      // Grab all elements with the 'onboard-hint' class
      const onboardHints = Array.from(
        document.querySelectorAll(`.${this.onboardingHintTarget}`)
        // sort them ascending order using the data-sequence attribute
      ).sort(function (a, b) {
        return (
          +a.dataset.options?.sequenceOrder - +b.dataset.options?.sequenceOrder
        );
      });
      // force absolute positioning on all onboard hints
      onboardHints.map(
        (currentHint) => (currentHint.style.position = "absolute")
      );

      // save onbord hint elements to object
      this.hintElements = onboardHints;
      // set initialization to true if we can grab an array of elements
      this.initialized = true;
      resolve();
    });
  }
  checkInitialized() {
    if (!this.initialized)
      throw new Error(
        "Module is not initialized. Please run this.init() before starting sequencer. Refer to documentation for help and arguments."
      );
  }
  startSequencer() {
    this.checkInitialized();
    // begin onboarding sequncer
    if (!this.isRunning) this.isRunning = true;

    let currentSequence = this.hintElements[this.currIndex];
    let options = currentSequence.dataset?.options
      ? JSON.parse(currentSequence.dataset.options)
      : {};

    const { sequenceOrder, type, timer, position, highlighting } = options;

    // // currently supports timed and confirm
    let sequenceType = type !== undefined ? type : "timed";
    this.currentHintType = sequenceType;
    this.checkTypes({ sequenceType, highlighting, position });

    // format position property
    for (const pos in position) {
      if (typeof position[pos] !== "string") {
        throw new Error(
          "Incorrect type passed to position options. Please ensure you are passing a string to your top, bottom, left, right inside of position object."
        );
      }

      if (position[pos].includes(" ")) {
        position[pos] = position[pos].replaceAll(" ", "");
      }
      if (
        !position[pos].includes("%") &&
        !position[pos].includes("px") &&
        !position[pos].includes("rem") &&
        !position[pos].includes("em")
      ) {
        position[pos] = `${position[pos]}px`;
      }
    }
    // if position property is left blank it is set to a default position
    let sequencePos = position || {
      top: "0px",
      right: "0px",
    };
    // // Sets absolute positioning based on the presence of the corresponding
    // // property passed into the onboard elements data-position attribute
    if (sequencePos?.top) currentSequence.style.top = sequencePos.top;
    if (sequencePos?.right) currentSequence.style.right = sequencePos.right;
    if (sequencePos?.bottom) currentSequence.style.bottom = sequencePos.bottom;
    if (sequencePos?.left) currentSequence.style.left = sequencePos.left;

    // // amount of time for each timed onboard hint to be displayed
    let sequenceTimer = timer || 2500;

    // // current onboard hint's direct parent element
    let elementParent = currentSequence.parentElement;

    // // force parent elements position to relative
    // // this forces the onboard hint's position to be relative to the direct parent element
    elementParent.style.position = "relative";

    if (highlighting && this.hasBackground) {
      this.toggleHighlighting(true);
    }

    // // final index of sequence elements array
    this.finalIndex = this.hintElements.length - 1;

    // // Display background
    if (this.hasBackground) this.toggleBackground();

    // // Toggles the first onboarding hint in hintElements array
    currentSequence.classList.add("active-sequence");

    // // checks current onboard hint if it is timed, or confirmation
    if (sequenceType === "timed") {
      // if type is timer then begin the timeout
      // pass in the value grabbed from data-timer attribute on our onboard-hint element
      this.toggleTimedSequence(sequenceTimer, sequenceType);
      return;
    }
  }
  checkTypes({}) {
    const optionTypes = arguments[0];
    if (typeof optionTypes.highlighting !== "boolean") {
      throw new Error(
        "Incorrect type passed to highlighting option. Please ensure Highlighting is passed a boolean."
      );
    }
    if (typeof optionTypes.sequenceType !== "string") {
      throw new Error(
        "Incorrect type passed to type option. Please ensure type is passed a string containing either 'timed' or 'confirm'."
      );
    }
    if (typeof optionTypes.position !== "object") {
      throw new Error(
        "Incorrect type passed to type position. Please ensure type is passed an object."
      );
    }
  }
  toggleTimedSequence(sequenceTimer, type, onFinishCallback) {
    if (type !== "timed")
      throw new Error(
        "Improper usage of toggleTimedSequence. Please check your code or revisit documentation."
      );

    this.checkInitialized(); // if type is timer then begin the timeout
    // pass in the value grabbed from data-timer attribute on our onboard-hint element
    const timeout = setTimeout(() => {
      // when timer is finished remove active class from current onboard hint
      this.removeActiveClass(this.currIndex);
      this.toggleHighlighting(false);
      // Iterates to next onboard hint
      this.currIndex += 1;

      // Check if we iterate past final index
      if (this.currIndex > this.finalIndex) {
        onFinishCallback();

        // terminate timeout
        clearTimeout(timeout);

        // reset onboard sequencer
        this.resetSequencer();

        // toggle off background
        if (this.hasBackground) this.toggleBackground(true);
        return;
      }

      // if we are not at the final index fire the sequencer again
      this.startSequencer();
    }, sequenceTimer);
  }
  toggleConfirmSequence() {
    this.checkInitialized();
    // Prevent confirm button from firing if current onboard hint is type timed
    if (this.currentHintType === "timed") return;

    this.toggleHighlighting(false);
    // remove active class from current onboard hint
    this.removeActiveClass(this.currIndex);

    // iterate to next onboard hint
    this.currIndex += 1;

    // Check if we iterate past final index
    if (this.currIndex > this.finalIndex) {
      // reset onboard sequencer
      this.resetSequencer();

      // toggle off background
      this.toggleBackground(true);

      return;
    }
    this.startSequencer();
  }
  toggleBackground(boolean = false) {
    if (!this.backgroundElement) {
      this.backgroundElement = document.querySelector(".onboard-background");
    }

    // true turns background off
    // false turns background on
    return boolean
      ? this.backgroundElement.classList.add("inactive")
      : this.backgroundElement.classList.remove("inactive");
  }
  toggleHighlighting(bool) {
    if (bool === undefined)
      throw new Error(
        "Improper usage of method: toggleHighlighting. Pleae revisit code, or documentation."
      );

    let parentDiv = this.hintElements[this.currIndex].parentElement;

    if (bool) return (parentDiv.style.zIndex = "100000");
    parentDiv.removeAttribute("style");
    parentDiv.style.position = "relative";
  }
  removeActiveClass(i) {
    if (!i && i !== 0)
      throw new Error(
        "Improper usage of removeActiveClass. Please check your code or revisit documentation."
      );
    // remove active class from the currently active onboard hint
    this.hintElements[i].classList.remove("active-sequence");
  }
  resetSequencer() {
    // this.removeActiveClass(this.currIndex);
    // reset initial values
    this.initialized = false;
    this.isRunning = false;
    this.currIndex = 0;
    this.finalIndex = null;
    // toggle background
    if (this.hasBackground) this.toggleBackground(true);
    if (this.onFinishCallback) this.onFinishCallback();
  }
}
const OnboardHint = ({
  options = {
    sequenceOrder: 1,
    highlighting: true,
    type: "timed",
    timer: 2500,
    position: {
      top: 0,
      left: 0,
    },
  },
  classes = [],
  children,
}) => {
  return (
    <div
      className={`onboard-hint ${classes}`}
      data-options={JSON.stringify(options)}
    >
      {children}
    </div>
  );
};
export { OnboardController, OnboardHint };
