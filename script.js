// fetch use upload file : cho phép tạo một network request
/*Async / Await là một tính năng của JavaScript giúp chúng ta làm việc với các hàm bất đồng bộ theo cách thú vị hơn và dễ hiểu hơn.
 Nó được xây dựng trên Promises và tương thích với tất cả các Promise dựa trên API.
 
 Async : để khai báo hàm bất đồng bộ
 await : tạm dừng việc thực hiện các hàm async
 */

// Phương thức có chứa random là để không lặp lại những item đã lấy




const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const mealEls = $('#meals');
const favoriteContainer = $('#fav-meals');

const searchTerm = $('#search-term');
const searchBtn = $('#search');
const mealPopup = $('#meal-popup');
const closePopup = $('#close-popup');
const mealInfoEl = $('#js-meal-info');

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/random.php");                // fetch : tìm về 
    const respData = await resp.json();
    const randomMeal = respData.meals[0];

    addMeal(randomMeal, true);

}

async function getMealById(id) {
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id);
    const respData = await resp.json(); // Array
    const meal = respData.meals[0];    // Tra ve doi vao ben trong khoi co id = meals
    return meal;
}

async function getMealBysearch(term) { // term : thuat ngu
    const resp = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s=" + term);

    const respData = await resp.json();

    const meals = respData.meals;

    return meals;

}


// Lay data tren server ve va gan vao bien mealData

function addMeal(mealData, random = false) {
    const meal = document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML = `

        <div class="meal-header">
            ${random ? `<span class="random">Random Recipe</span>` : ""}
            <img src="${mealData.strMealThumb}"
            alt="${mealData.strMeal}">
        </div>

        <div class="meal-body">
                <h4>${mealData.strMeal}</h4>
                <button class="fav-btn">
                    <i class="fas fa-heart"></i>
                </button>
        </div>
    `;

    const btn = meal.querySelector('.meal-body .fav-btn');

    btn.addEventListener("click", function () {
        if (btn.classList.contains("active")) {
            removeMealFromLS(mealData.idMeal);
            btn.classList.remove("active");
        } else {
            addMealToLS(mealData.idMeal);
            btn.classList.add("active");
        }

        fetchFavMeals();
    });

    meal.addEventListener("click", () => {
        showMealInfor(mealData);
    });

    mealEls.appendChild(meal);
}


// Add Meal từ local storage
function addMealToLS(mealId) {
    const mealIds = getMealsFromLS();
    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

// Remove Meal từ local storage
function removeMealFromLS(mealId) {
    const mealIds = getMealsFromLS();
    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealId)));
}

// Lấy Meal từ local storage
function getMealsFromLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));  // return Array

    return mealIds === null ? [] : mealIds;
}


async function fetchFavMeals() {
    // clear the container
    favoriteContainer.innerHTML = "";

    const mealIds = getMealsFromLS();  // gan bien vao mang
    const meals = [];    // khởi tạo mảng
    for (let i = 0; i < mealIds.length; i++) {  // Lặp qua độ dài mảng
        const mealId = mealIds[i];              // gán mảng tương ứng vào biến khởi tạo
        const meal = await getMealById(mealId);  // Call API về biến

        addMealFav(meal);         // Thêm phần tử
        meals.push(meal);         //  Push vào mảng khởi tạo              
    }

    console.log(meals);

    // add them to the screen
}

// Them mon yeu thich
function addMealFav(mealData) {
    const favMeal = document.createElement('li');   // Tạo thẻ li mới 

    // Inner vào thẻ li
    favMeal.innerHTML = `           
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
            <span>${mealData.strMeal}</span>
            <button class="clear"><i class="fas fa-times"></i></button>
    `;

    const btn = favMeal.querySelector('.clear');

    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeMealFromLS(mealData.idMeal);

        fetchFavMeals();
    });


    favMeal.addEventListener("click", () => {
        showMealInfor(mealData);
    });

    favoriteContainer.appendChild(favMeal);   // Gắn thêm nút con mới là favMeal vào danh sách(Phep gans)
}

function showMealInfor(mealData) {
    // clean it up
    mealInfoEl.innerHTML = "";

    const mealEl = document.createElement('div');

    const ingridient = [];

    // get ingridient and measures
    for (let index = 1; index <= 20; index++) {
        if (mealData['strIngredient' + index]) {
            ingridient.push(`${mealData['strIngredient' + index]} - ${mealData['strMeasure' + index]}`)

        } else {
            break;
        }
    }

    // Update the meal info
    mealEl.innerHTML = `

        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">

        <p>${mealData.strInstructions}</p>

        <h3>Ingredient</h3>

        <ul>
            ${ingridient.map((ing) => `
                <li>${ing}</li>
            `).join('')}
        </ul>
    `;



    mealInfoEl.appendChild(mealEl);

    mealPopup.classList.remove('hidden');
}


searchBtn.addEventListener("click", async () => {

    // Clear container
    mealEls.innerHTML = "";

    const search = searchTerm.value;

    const meals = await getMealBysearch(search);

    if (meals) {

        meals.forEach((meal) => {
            addMeal(meal);
        });
    }
});


closePopup.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});