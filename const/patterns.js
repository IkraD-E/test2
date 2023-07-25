const httpPattern = /(https?:\/\/)(w{3}\.)?(((\d{1,3}\.){3}\d{1,3})|((\w-?)+\.(ru|com)))(:\d{2,5})?((\/.+)+)?\/?#?/;

const imagePattern = /https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]/;

module.exports = {
  httpPattern,
  imagePattern,
};
