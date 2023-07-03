import React from "react";
import { Carousel as AntdCarousel } from "antd/dist/antd";
import { Image } from "antd";
import { ComponentConfig } from "@measured/puck/types/Config";

export type CarouselProps = {
  slides: { imageUrl: string; alt: string }[];
};

const contentStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
  margin: 0,
  height: "400px",
  color: "#fff",
  background: "#364d79",
};

export const Carousel: ComponentConfig<CarouselProps> = {
  fields: {
    slides: {
      type: "group",
      groupFields: { imageUrl: { type: "text" }, alt: { type: "text" } },
    },
  },
  render: ({ slides = [] }) => {
    return (
      <AntdCarousel>
        {slides.map((slide, i) => {
          return (
            <div key={`slide_${i}`}>
              <div style={contentStyle}>
                <Image
                  alt={slide.alt}
                  src={slide.imageUrl}
                  wrapperStyle={{ position: "absolute", width: "100%" }}
                />
              </div>
            </div>
          );
        })}

        {slides.length === 0 && (
          <div>
            <div style={contentStyle}>Carousel</div>
          </div>
        )}
      </AntdCarousel>
    );
  },
};
