import { useState } from "react";
import "./slider.scss";

function Slider({ images }) {


  const autoImgClass = () => {

    let className = '';

    switch (images.length) {
      case 2:
        className = 'imgItemOne';
        break;
      case 3:
        className = 'imgItemTwo';
        break;
      case 4:
        className = 'imgItemThree';
        break;
      case 5:
        className = 'imgItemFour';
        break;
    }
    return className;
  }

  const [imageIndex, setImageIndex] = useState(null);

  const changeSlide = (direction) => {
    if (direction === "left") {
      if (imageIndex === 0) {
        setImageIndex(images.length - 1);
      } else {
        setImageIndex(imageIndex - 1);
      }
    } else {
      if (imageIndex === images.length - 1) {
        setImageIndex(0);
      } else {
        setImageIndex(imageIndex + 1);
      }
    }
  };

  return (
      <>
        {imageIndex !== null && (
            <div className="fullSlider">
              <div className="arrow">
                <span className="material-symbols-outlined" onClick={() => changeSlide("left")}>chevron_left</span>
              </div>
              <div className="imgContainer">
                <img src={images[imageIndex]} alt="image"/>
              </div>
              <div className="arrow">
                <span className="material-symbols-outlined" onClick={() => changeSlide("right")}>chevron_right</span>
              </div>
              <div className="close">
                <span className="material-symbols-outlined" onClick={() => setImageIndex(null)}>close</span>
              </div>
            </div>
        )}

        <div className="slider">
          <div className="bigImage">
            <img src={images[0]} alt="image" onClick={() => setImageIndex(0)}/>
          </div>
          {
              images.length > 1 &&
              <div className="smallImages">
                {images.slice(0, 5).slice(1).map((image, index) => (
                    <div key={index} className={autoImgClass()}>
                      <img
                          src={image}
                          alt="image"
                          onClick={() => setImageIndex(index + 1)}
                      />
                    </div>
                ))}
              </div>
          }

        </div>
      </>
  );
}

export default Slider;
