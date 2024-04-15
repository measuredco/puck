// from beautiful-dnd
export const curves = {
  outOfTheWay: "cubic-bezier(0.2, 0, 0, 1)",
  drop: "cubic-bezier(.2,1,.1,1)",
};

export const timings = {
  outOfTheWay: 200,
  // greater than the out of the way time
  // so that when the drop ends everything will
  // have to be out of the way
  minDropTime: 330,
  maxDropTime: 550,
};
