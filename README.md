# 🗺️ Mapty: Map Your Workouts

![HTML5](https://img.shields.io/badge/html5-%23E34F26.svg?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/css3-%231572B6.svg?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Leaflet](https://img.shields.io/badge/Leaflet-199900?style=for-the-badge&logo=Leaflet&logoColor=white)

Mapty is a web application that allows users to log their running and cycling workouts on an interactive map. Users can track their distance, duration, pace, and steps/minute (cadence) or elevation gain, depending on the workout type.

> **Note:** This project was primarily built as part of ["The Complete JavaScript Course"](https://www.udemy.com/course/the-complete-javascript-course/) by Jonas Schmedtmann. It serves as my practical implementation to master advanced Vanilla JavaScript concepts, particularly Object-Oriented Programming (OOP) and real-world API integration.

## ✨ Features

* **Geolocation:** Automatically fetches the user's current location to render the map.
* **Log Workouts:** Choose between Running or Cycling, and input distance, time, and specific metrics (cadence/elevation).
* **Interactive Map:** Clicks on the map automatically open a form to log a workout at that exact coordinate.
* **Data Persistence:** Workouts are saved in the browser's `localStorage` so data remains even after a page reload.
* **Map Viewport:** Clicking on a workout in the list smoothly moves the map to that specific workout's location.
* **Custom Features (Extended):** Added dynamic UI elements such as custom **Edit and Delete** buttons using advanced DOM manipulation.

## 🧠 What I Learned

Building this project heavily solidified my understanding of modern JavaScript architecture:

1. **Object-Oriented Programming (OOP):** * Structuring the entire application using ES6 Classes.
   * Managing data state and DOM interactions within a unified `App` class.
   * Using child classes (`Running` and `Cycling`) that inherit from a parent `Workout` class.
2. **Advanced DOM Manipulation & Event Delegation:** * Handling complex UI events dynamically. I learned how to properly manage event bubbling, specifically solving issues with `mouseover` and `mouseout` by utilizing `e.relatedTarget` and the `.contains()` method to prevent unintended UI flickering when injecting dynamic HTML for edit/delete buttons.
3. **Asynchronous JavaScript:** * Using the Geolocation API to fetch coordinates asynchronously.
4. **Third-Party Libraries:** * Integrating and interacting with the Leaflet.js library for map rendering and event handling.

## 🚀 How to Run Locally

Since this is a client-side vanilla JavaScript application, there is no complex build step required.

1. Clone this repository:
   ```bash
   git clone [https://github.com/fahri238/mapty.git](https://github.com/fahri238/mapty.git)