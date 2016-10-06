// import Convertor from './../src/convertor';
//
// const c = new Convertor();
//
// function test1() {
//   const input = `
//   .some_class {
//     color: red;
//     bgcolor: mata;
//   }`;
//   const format = 'css';
//   const how = 'javascript_file';
//
//   const output = c.convert(input, format, how);
//   console.log('Formatted: \n', output.formatted);
//   console.log('\nErrors: ', JSON.stringify(output.errors, null, 2));
// }
//
// function test2() {
//   const input = `@charset "UTF-8";
//   @import "test";
//
//   /* Random comment out there */
//
//   /* List crap thing */
//   .list {
//     position: absolute;
//     left: 10px;
//     right: 10;
//     top: 10%;
//     bottom: 10em;
//
//     &__item {
//       color: black;
//       font-size: 12px;
//
//       // Make list items huge on small screens
//       @media only screen and (max-width: 500px) {
//         width: 100%;
//       }
//
//       // Make list items half screen on mid screens
//       @media only screen and (max-width: 1024px) {
//         width: 50%;
//       }
//
//       /* Make list items 1/4 of the screen on mid screens */
//       @media only screen and (max-width: 1400px) {
//         width: 25%;
//       }
//
//       &--hover {
//         color: red;
//       }
//
//       &--active {
//         color: green;
//       }
//     }
//
//     &--zebra {
//       color: $defaultColor;
//     }
//   }`;
//   const format = 'scss';
//   const how = 'javascript_file';
//
//   c.setIncludePath([__dirname]);
//   const output = c.convert(input, format, how);
//   console.log('Formatted: \n', output.formatted);
//   console.log('\nErrors: ', JSON.stringify(output.errors, null, 2));
// }
//
// function test3() {
//   const input = `
//   .col-1-4 {
//   background-color: green; }
//   @media (max-width: 600px) {
//     .col-1-4 {
//       float: left;
//       display: block;
//       width: 100%;
//       min-width: 300; } }
//   @media (max-width: 1200px) {
//     .col-1-4 {
//       float: left;
//       display: block;
//       width: 50%;
//       min-width: 300;
//       max-width: 500; } }
//   @media (min-width: 1201px) {
//     .col-1-4 {
//       float: left;
//       display: block;
//       width: 25%;
//       min-width: 300;
//       max-width: 500; } }
//
// .col-2-4 {
//   background-color: yellow; }
//   @media (max-width: 600px) {
//     .col-2-4 {
//       float: left;
//       display: block;
//       width: 100%;
//       min-width: 300;
//       max-width: 500; } }
//   @media (max-width: 1200px) {
//     .col-2-4 {
//       float: left;
//       display: block;
//       width: 100%;
//       min-width: 300;
//       max-width: 500; } }
//   @media (min-width: 1201px) {
//     .col-2-4 {
//       float: left;
//       display: block;
//       width: 50%;
//       min-width: 600;
//       max-width: 1000; } }
//
// .col-3-4 {
//   background-color: red; }
//   @media (max-width: 600px) {
//     .col-3-4 {
//       float: left;
//       display: block;
//       width: 100%;
//       min-width: 300;
//       max-width: 500; } }
//   @media (max-width: 1200px) {
//     .col-3-4 {
//       float: left;
//       display: block;
//       width: 100%;
//       min-width: 600;
//       max-width: 1000; } }
//   @media (min-width: 1201px) {
//     .col-3-4 {
//       float: left;
//       display: block;
//       width: 75%;
//       min-width: 900;
//       max-width: 1500; } }
//
// .col-4-4 {
//   background-color: blue; }
//   @media (max-width: 600px) {
//     .col-4-4 {
//       float: left;
//       display: block;
//       width: 100%;
//       min-width: 300;
//       max-width: 500; } }
//   @media (max-width: 1200px) {
//     .col-4-4 {
//       float: left;
//       display: block;
//       width: 100%;
//       min-width: 600;
//       max-width: 1000; } }
//   @media (min-width: 1201px) and (max-width:2000px) {
//     .col-4-4 {
//       float: left;
//       display: block;
//       width: 100%;
//       min-width: 1200;
//       max-width: 2000; } }
//     `,
//     format = 'scss',
//     how = 'javascript_file';
//
//   c.setIncludePath([__dirname]);
//   const output = c.convert(input, format, how);
//   console.log('Formatted: \n', output.formatted);
//   console.log('\nErrors: ', JSON.stringify(output.errors, null, 2));
// }
//
// test1();
// test2();
// test3();
