$(document).ready(function () {

  // JQuery For SideBar DropDown

  $('.sub-btn').click(function () {
    $(this).next('.sub-menu').slideToggle();
    $(this).find('.dropdown').toggleClass('rotate');
  });

  // JQuery For ScrollBar DropDown

  $('.nav-dropdown').hover(function () {
    $(this).find('.nav-dropdown-content').stop(true, true).slideDown();
  }, function () {
    $(this).find('.nav-dropdown-content').stop(true, true).slideUp();
  });


  // JQuery For Showing SideBar Using Down Hamburger

  $('.hamburger').click(function () {
    $('.side-bar').addClass('active');
    $('.hamburger').css("visibility", "hidden");
  });

  // JQuery For Closing SideBar Using Down Hamburger

  $('.close-btn-hamburger').click(function () {
    $('.side-bar').removeClass('active');
    $('.hamburger').css("visibility", "visible");
  });

  // JQuery For Showing SideBar Using Top Hamburger

  $('.hamburger-top').click(function () {
    $('.side-bar').addClass('active');
    $('.hamburger-top').css("visibility", "hidden");
  });

  // JQuery For Closing SideBar Using Top Hamburger

  $('.close-btn-hamburger').click(function () {
    $('.side-bar').removeClass('active');
    $('.hamburger-top').css("visibility", "visible");
  });



  // Function to open the search box
  $('.search-container-top').click(function () {
    $('.search-container-top-box').addClass('show');
  });

  // Function to close the search box
  $('.search-container-top-box .close-btn-search').click(function () {
    $('.search-container-top-box').removeClass('show');
  });



  // JQuery For Load More Content in Magazine page

  $(".magazine_abc").slice(0, 8).show();
  var itemsToShowInMagazine = 4;
  $(".load-more-magazine").on('click', function (e) {
    e.preventDefault();
    var hiddenItems = $(".magazine_abc:hidden").slice(0, itemsToShowInMagazine);
    hiddenItems.show();
    if ($(".magazine_abc:hidden").length === 0) {
      $(".load-more-magazine").css('visibility', 'hidden');
    }

    $('html,body').animate({
      scrollTop: hiddenItems.last().offset().top
    }, 1000);
  });




  // JQuery For Load More Content

  $(".abc").slice(0, 3).show();
  var itemsToShow = 3;
  $(".load-more").on('click', function (e) {
    e.preventDefault();
    var hiddenItems = $(".abc:hidden").slice(0, itemsToShow);
    hiddenItems.show();
    if ($(".abc:hidden").length === 0) {
      $(".load-more").css('visibility', 'hidden');
    }

    $('html,body').animate({
      scrollTop: hiddenItems.last().offset().top
    }, 1000);
  });



});


document.addEventListener('DOMContentLoaded', (event) => {

  // Start JavaScript For Image Slider
  var indexValue = 0;
  function slideShow(){
    setTimeout(slideShow, 3000);
    var x;
    const img = document.querySelectorAll(".box>.images >a> img");
    for(x = 0; x < img.length; x++){
      img[x].style.display = "none";
    }
    indexValue++;
    if(indexValue > img.length){indexValue = 1}
    img[indexValue -1].style.display = "block";
  }
  slideShow();
  // End JavaScript For Image Slider
  
  
  


const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');
const contentWrapper = document.querySelector('.content-wrapper');
let currentIndex = 0;

const contents = document.querySelectorAll('.slider_box');
const contentCount = contents.length;

rightArrow.addEventListener('click', () => {
  if (currentIndex < contentCount - 1) {
    currentIndex++;
    updateContentPosition();
  }
});

leftArrow.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    updateContentPosition();
  }
});

function updateContentPosition() {
  const offset = -currentIndex * 100;
  contents.forEach((content) => {
    content.style.transform = `translateX(${offset}%)`;
  });
}




  let slides = document.querySelectorAll('.wrapper .slide');
  let currentSlide = 0;

  function showNextSlide() {
    slides[currentSlide].classList.remove('active');
    slides[currentSlide].classList.add('inactive');

    currentSlide = (currentSlide + 1) % slides.length;

    slides[currentSlide].classList.remove('inactive');
    slides[currentSlide].classList.add('active');
  }

  // Ensure initial state is correct
  slides.forEach((slide, index) => {
    if (index !== currentSlide) {
      slide.classList.add('inactive');
    }
  });

  setTimeout(() => {
    showNextSlide();
    setInterval(showNextSlide, 5000); // Change slide every 5 seconds
  }, 5000); // Delay the first slide change to match the interval





  
  
  
  
    // JavaScript For Scroll The Slider Horizontally
  
    const slider = document.querySelector(".image_slider");
    
    let isDown = false;
    let startX;
    let scrollLeft;
    
    slider.addEventListener("mousedown", (e) => {
      isDown = true;
      slider.classList.add("active");
      startX = e.pageX - slider.offsetLeft; 
      scrollLeft = slider.scrollLeft; 
    });
    
    slider.addEventListener("mouseleave", () => {
      isDown = false;
      slider.classList.remove("active");
    });
    
    slider.addEventListener("mouseup", () => {
      isDown = false;
      slider.classList.remove("active");
    });
    
    slider.addEventListener("mousemove", (e) => {
      if (!isDown) return; 
      e.preventDefault(); 
      const x = e.pageX - slider.offsetLeft; 
      const walk = (x - startX); 
      slider.scrollLeft = scrollLeft - walk; 
    });
  
  
  
  
  
  
  
  
  
  
  
    function FormValidation(event) {
      const first_line = document.getElementsByClassName('first-line')[0];
      const second_line = document.getElementsByClassName('second-line')[0];
      const name = document.getElementById('name').value;
      const phone_no = document.getElementById('phone').value;
      const email = document.getElementById('EMail').value;
      const address = document.getElementById('Address').value;
      const subject = document.getElementById('Subject').value;
      const description = document.getElementById('description').value;
    
      // Reset error messages
      document.getElementById('nameError').innerText = '';
      document.getElementById('phoneError').innerText = '';
      document.getElementById('addressError').innerText = '';
      document.getElementById('subjectError').innerText = '';
      document.getElementById('emailError').innerText = '';
      document.getElementById('descriptionError').innerText = '';
    
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const phoneRegex = /^\+91[0-9]{10}$/;
    
      let isValid = true;
    
      if (name === "") {
          document.getElementById('nameError').innerText = 'Please enter your name.';
          first_line.style.marginBottom = "20px";
          isValid = false;
      } else {
          first_line.style.marginBottom = ""; 
      }
    
      if (isValid && !emailRegex.test(email)) {
          document.getElementById('emailError').innerText = 'Please enter a valid e-mail address.';
          first_line.style.marginBottom = "20px";
          isValid = false;
      }
    
      if (isValid && address === "") {
          document.getElementById('addressError').innerText = 'Please enter your address.';
          second_line.style.marginBottom = "20px";
          isValid = false;
      }
    
      if (isValid && !phoneRegex.test(phone_no)) {
          document.getElementById('phoneError').innerText = 'Please enter a valid 10-digit phone number.';
          second_line.style.marginBottom = "20px";
          isValid = false;
      }
    
      if (isValid && subject === "") {
          document.getElementById('subjectError').innerText = 'Please enter your subject.';
          isValid = false;
      }
    
      if (isValid && description.trim() === "") {
          document.getElementById('descriptionError').innerText = 'Please enter your description.';
          isValid = false;
      }
    
      if (isValid) {
        alert('Your message was sent successfully!');
        return true;
      }
    
      event.preventDefault();
      return false;
    }
  
   
    
      
});





    