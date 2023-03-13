import React from "react";

import { SimpleGraph } from "../simpleGraph.js";

// More on default export: https://storybook.js.org/docs/react/writing-stories/introduction#default-export
export default {
  title: "SimpleGraph",
  component: SimpleGraph,
  // More on argTypes: https://storybook.js.org/docs/react/api/argtypes
  argTypes: {
    width: { control: "number" },
    height: { control: "number" }
  },
  args: {
    vertices: [
      { id: "One", fill: "red", label: "Foo" },
      { id: "Two", fill: "orange", label: "Bar" },
      { id: "Three", fill: "yellow", label: "Three" },
      { id: "Four", fill: "green", label: "Four" },
      { id: "Five", fill: "blue", label: "Five" },
      { id: "A", fill: "indigo", label: "A" },
      { id: "B", fill: "violet", label: "B" },
      { id: "C", fill: "black", label: "C" },
    ],
    edges: [
      { id: "OneTwo", source: "One", target: "Two", length: 200 },
      { id: "OneThree", source: "One", target: "Three", length: 200 },
      { id: "OneFour", source: "One", target: "Four", length: 200 },
      { id: "OneFive", source: "One", target: "Five", length: 200 },
      { id: "TwoThree", source: "Two", target: "Three", length: 200 },
      { id: "TwoFour", source: "Two", target: "Four", length: 200 },
      { id: "TwoFive", source: "Two", target: "Five", length: 200 },
      { id: "ThreeFour", source: "Three", target: "Four", length: 200 },
      { id: "ThreeFive", source: "Three", target: "Five", length: 200 },
      { id: "FourFive", source: "Four", target: "Five", length: 200 },
      { id: "AB", source: "A", target: "B", length: 100 },
      { id: "AC", source: "A", target: "C", length: 100 },
      { id: "BC", source: "B", target: "C", length: 100 },
    ],
    width: 400,
    height: 400,
  },
};

// More on component templates: https://storybook.js.org/docs/react/writing-stories/introduction#using-args
const Template = (args) => <SimpleGraph {...args} />;

export const Primary = Template.bind({});
// More on args: https://storybook.js.org/docs/react/writing-stories/args
Primary.args = {};

export const Small = Template.bind({});
Small.args = {
    vertices: [
      { id: "A", fill: "indigo", label: "A" },
      { id: "B", fill: "violet", label: "B" },
      { id: "C", fill: "black", label: "C" },
    ],
    edges: [
      { id: "AB", source: "A", target: "B", length: 30 },
      { id: "AC", source: "A", target: "C", length: 30 },
      { id: "BC", source: "B", target: "C", length: 30 },
    ],
  width: 100,
  height: 100,
};
