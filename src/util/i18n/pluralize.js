export function pluralize (number, word, postfixes) {
  const mod10 = number % 10,
    mod100 = number % 100;
  let postfix = '';
  if (mod100 >= 5 && mod100 < 21
    || mod10 >= 5 && mod10 <= 9
    || !mod10) {
    postfix = postfixes[2];
  } else if (mod10 === 1) {
    postfix = postfixes[0];
  } else {
    postfix = postfixes[1];
  }
  return `${word}${postfix}`;
}
