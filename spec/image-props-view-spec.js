'use babel';

import { parse_pattern, write_pattern } from '../lib/image-props-view';

describe('ImagePropsView::parse_pattern', () => {
  it('raw string', () => {
    expect(parse_pattern('"foo.png"'))
    .toEqual({name: "foo", ext: ".png", similarity: "0.75"});
  });
  it('no params', () => {
    expect(parse_pattern('Pattern("foo.png")'))
    .toEqual({name: "foo", ext: ".png", similarity: "0.75"});
  });
  it('one param', () => {
    expect(parse_pattern('Pattern("foo.png").similarity(0.40)'))
    .toEqual({name: "foo", ext: ".png", similarity: "0.40"});
  });
  it('multiple params', () => {
    expect(parse_pattern('Pattern("foo.png").similarity(0.40).cake("delicious")'))
    .toEqual({name: "foo", ext: ".png", similarity: "0.40", cake: '"delicious"'});
  });
});

describe('ImagePropsView::write_pattern', () => {
  it('raw string', () => {
    expect(write_pattern({similarity: {value: "0.75"}, offset_x: {value: "0"}, offset_y: {value: "0"}}))
    .toEqual('"foo.png"');
  });
  it('one param', () => {
    expect(write_pattern({similarity: {value: "0.40"}, offset_x: {value: "0"}, offset_y: {value: "0"}}))
    .toEqual('Pattern("foo.png").similarity(0.40)');
  });
  it('multiple params', () => {
    expect(write_pattern({similarity: {value: "0.40"}, offset_x: {value: "4"}, offset_y: {value: "2"}}))
    .toEqual('Pattern("foo.png").similarity(0.40).offset(4, 2)');
  });
});
