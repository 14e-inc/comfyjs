// Yeoman discovers generators at generators/<name>/index.js.
// This shim delegates to the compiled TypeScript build so the source
// of truth stays in src/ and the generator is still found by `yo`.
export { default } from '../../dist/index.js';
