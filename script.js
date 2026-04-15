'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const containerWorkoutCycling = document.querySelector('workout--cycling');

///////////////////////////////////////////////////////////////////////////
// Using the Geolocation API
// Displaying a Map Using Leaflet Library
// Displaying a Map Marker
// Rendering Workout Input Form

// Managing Workout Data: Creating Classes
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  clicks = 0;

  constructor(coords, distance, duration) {
    // this.date = ...
    // this.id = ... // only if public field not working because it's using lates javscript version
    this.coords = coords; // [lat. lng]
    this.distance = distance; //in km
    this.duration = duration; //in min
  }

  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]} ${this.date.getDate()}`;
  }

  click() {
    this.clicks++;
  }
}

class Running extends Workout {
  type = 'running';
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

const run1 = new Running([1213, -121], 12, 11, 112);
const cycle1 = new Cycling([1213, -121], 23, 12, 120);

//////////////////////////////////////////////////////////////
// Refactoring for Project Architecture
class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];
  #editMode = false;
  #editWorkoutId = null;

  constructor() {
    // get user position
    this._getPosition();

    // get data from localStorage
    this._getLocalStorage();

    // event handlers
    form.addEventListener('submit', this._newWorkout.bind(this));

    inputType.addEventListener('change', this._toggleEventLoadField);

    containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));

    containerWorkouts.addEventListener('click', this._handleEdit.bind(this));
    // this._showEditDelete();
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('cannot get your current position');
        },
      );
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, this.#mapZoomLevel);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling maps on the click
    this.#map.on('click', this._showForm.bind(this));

    this.#workouts.forEach(workout => {
      this._renderWorkoutMarker(workout);
    });
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _hideForm() {
    // empty inputs
    inputElevation.value =
      inputDuration.value =
      inputDistance.value =
      inputCadence.value =
        '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleEventLoadField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    e.preventDefault();

    const isValinInput = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));

    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    let workouts;

    if (this.#editMode) {
      const workout = this.#workouts.find(
        work => work.id === this.#editWorkoutId,
      );

      workout.distance = distance;
      workout.duration = duration;
      workout.type = type;

      if (type === 'running') {
        const cadence = +inputCadence.value;

        if (
          !isValinInput(distance, duration, cadence) ||
          !allPositive(distance, duration, cadence)
        )
          return alert('Inputs have to be positive numbers!');

        workout.cadence = cadence;
        workout.pace = workout.duration / workout.distance;
      }
      if (type === 'cycling') {
        const elevation = +inputElevation.value;

        if (
          !isValinInput(distance, duration, elevation) ||
          !allPositive(distance, duration)
        )
          return alert('Inputs have to be positive numbers!');

        workout.elevationGain = elevation;
        workout.speed = workout.distance / (workout.duration / 60);
      }

      this.#editMode = false;
      this.#editWorkoutId = null;

      this._hideForm();
      this._setLocalStorage();
      location.reload();

      return;
    } else {
      const { lat, lng } = this.#mapEvent.latlng;

      // If workout running, create running object
      if (type === 'running') {
        const cadence = +inputCadence.value;

        if (
          !isValinInput(distance, duration, cadence) ||
          !allPositive(distance, duration, cadence)
        )
          return alert('Inputs have to be positive numbers!');
        workouts = new Running([lat, lng], distance, duration, cadence);
      }

      // If workout cycling, create cycling object
      if (type === 'cycling') {
        const elevation = +inputElevation.value;

        if (
          !isValinInput(distance, duration, elevation) ||
          !allPositive(distance, duration)
        )
          return alert('Inputs have to be positive numbers!');
        workouts = new Cycling([lat, lng], distance, duration, elevation);
      }
    }

    // Add new object to workout array
    this.#workouts.push(workouts);

    // Render workout on map as marker
    this._renderWorkoutMarker(workouts);

    // Render workout in list
    this._renderWorkout(workouts);

    // hide form and clear input fields
    this._hideForm();

    // set local storage to all workouts
    this._setLocalStorage();
  }

  // _showEditDelete(workouts) {
  //   containerWorkouts.addEventListener('mouseover', e => {
  //     const workoutEl = e.target.closest('.workout');

  //     if (!workoutEl) return;

  //     if (workoutEl.querySelector('.workout__edit--delete')) return;

  //     const workout = this.#workouts.find(work => {
  //       return work.id === workoutEl.dataset.id;
  //     });

  //     let html = `
  //       <div class="workout__edit--delete">
  //           <div class="workout__details">
  //             <span class="workout__value">✏️</span>
  //             <span class="workout__unit">edit</span>
  //           </div>
  //           <div class="workout__details">
  //             <span class="workout__value">🗑️</span>
  //             <span class="workout__unit">delete</span>
  //       </div>
  //     `;

  //     workoutEl.insertAdjacentHTML('beforeend', html);
  //   });

  //   containerWorkouts.addEventListener('mouseout', e => {
  //     const workoutEl = e.target.closest('.workout');

  //     if (!workoutEl) return;

  //     if (workoutEl.contains(e.relatedTarget)) return;

  //     const editDeleteDiv = document.querySelector('.workout__edit--delete');
  //     if (editDeleteDiv) {
  //       editDeleteDiv.remove();
  //     }
  //   });
  // }

  _handleEdit(e) {
    const btnEdit = e.target.closest('.workout__edit--delete');

    if (!btnEdit) return;

    const workoutEl = e.target.closest('.workout');
    const workout = this.#workouts.find(work => {
      return work.id == workoutEl.dataset.id;
    });

    if (workout) {
      this.#editMode = true;
      this.#editWorkoutId = workout.id;

      this._showForm();
      inputType.value = workout.type;
      inputDistance.value = workout.distance;
      inputDuration.value = workout.duration;

      console.log(workout);

      if (workout.type === 'running') {
        inputCadence
          .closest('.form__row')
          .classList.remove('form__row--hidden');
        inputElevation.closest('.form__row').classList.add('form__row--hidden');
        inputCadence.value = workout.cadence;
      } else {
        inputElevation
          .closest('.form__row')
          .classList.remove('form__row--hidden');
        inputCadence.closest('.form__row').classList.add('form__row--hidden');
        inputElevation.value = workout.elevationGain;
      }
    }
  }

  _renderWorkoutMarker(workouts) {
    L.marker(workouts.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workouts.type}-popup`,
        }),
      )
      .setPopupContent(
        `${workouts.type === 'running' ? '🏃‍♂️' : '🚴'} ${workouts.description}`,
      )
      .openPopup();
  }

  // RENDERING WORKOUT
  _renderWorkout(workouts) {
    let html = `
        <li class="workout workout--${workouts.type}" data-id="${workouts.id}">  
          <h2 class="workout__title">${workouts.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workouts.type === 'running' ? '🏃‍♂️' : '🚴'}</span>
            <span class="workout__value">${workouts.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workouts.duration}</span>
            <span class="workout__unit">min</span>
          </div>
    `;

    if (workouts.type === 'running')
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workouts.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workouts.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
          <div class="workout__edit--delete">
            <div class="workout__details">
              <span class="workout__value">✏️</span>
              <span class="workout__unit">edit</span>
            </div>
            <div class="workout__details">
              <span class="workout__value">🗑️</span>
              <span class="workout__unit">delete</span>
        </div>
          </div>
          
        </li>`;

    if (workouts.type === 'cycling')
      html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workouts.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workouts.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
          <div class="workout__edit--delete">
            <div class="workout__details">
              <span class="workout__value">✏️</span>
              <span class="workout__unit">edit</span>
            </div>
            <div class="workout__details">
              <span class="workout__value">🗑️</span>
              <span class="workout__unit">delete</span>
        </div>
          </div>
          
        </li>`;

    form.insertAdjacentHTML('afterend', html);
  }

  // MOVE TO MARKER ON CLICK
  _moveToPopup(e) {
    if (e.target.closest('.workout__edit--delete')) return;
    const workoutEl = e.target.closest('.workout');

    if (!workoutEl) return;

    const workout = this.#workouts.find(
      work => work.id === workoutEl.dataset.id,
    );

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    // using the public interface
    // workout.click();
  }

  // wORKING WITH LOCALSTORAGE
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workouts));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(workout => {
      this._renderWorkout(workout);
    });
  }

  reset() {
    localStorage.removeItem('workouts');
    location.reload();
  }
}

const app = new App();

///////////////////////////////////////////////////////////////////////////
