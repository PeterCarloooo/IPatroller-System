import React from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import Swiper modules
import { Navigation, Pagination, Scrollbar } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';
import './Slider.css';

const Slider = () => {
  return (
    <Swiper
      modules={[Navigation, Pagination, Scrollbar]}
      direction={'vertical'}
      loop={true}
      pagination={{
        el: '.swiper-pagination',
        clickable: true,
      }}
      navigation={{
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      }}
      scrollbar={{
        el: '.swiper-scrollbar',
        draggable: true,
      }}
      className="mySwiper"
    >
      <SwiperSlide>
        <div className="flex items-center justify-center h-full bg-gray-200">
          <h2 className="text-2xl">Slide 1</h2>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="flex items-center justify-center h-full bg-gray-300">
          <h2 className="text-2xl">Slide 2</h2>
        </div>
      </SwiperSlide>
      <SwiperSlide>
        <div className="flex items-center justify-center h-full bg-gray-400">
          <h2 className="text-2xl">Slide 3</h2>
        </div>
      </SwiperSlide>
    </Swiper>
  );
};

export default Slider; 