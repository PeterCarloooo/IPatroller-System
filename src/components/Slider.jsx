import React, { useEffect, useRef } from 'react';
// Import Swiper JS
import Swiper from 'swiper';
// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import './Slider.css';

const Slider = () => {
  const swiperRef = useRef(null);

  useEffect(() => {
    // Initialize Swiper
    const swiper = new Swiper('.swiper', {
      // Optional parameters
      direction: 'vertical',
      loop: true,

      // If we need pagination
      pagination: {
        el: '.swiper-pagination',
      },

      // Navigation arrows
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },

      // And if we need scrollbar
      scrollbar: {
        el: '.swiper-scrollbar',
      },
    });

    // Cleanup
    return () => {
      if (swiper) swiper.destroy();
    };
  }, []);

  return (
    // Slider main container
    <div className="swiper">
      {/* Additional required wrapper */}
      <div className="swiper-wrapper">
        {/* Slides */}
        <div className="swiper-slide">Slide 1</div>
        <div className="swiper-slide">Slide 2</div>
        <div className="swiper-slide">Slide 3</div>
      </div>

      {/* If we need pagination */}
      <div className="swiper-pagination"></div>

      {/* If we need navigation buttons */}
      <div className="swiper-button-prev"></div>
      <div className="swiper-button-next"></div>

      {/* If we need scrollbar */}
      <div className="swiper-scrollbar"></div>
    </div>
  );
};

export default Slider; 