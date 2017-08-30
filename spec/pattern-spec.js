'use babel';

import { parse_pattern, write_pattern } from '../lib/pattern';

describe('ImagePropsView::parse_pattern', () => {
  it('raw string', () => {
    expect(parse_pattern('"foo.png"'))
    .toEqual({name: "foo.png", similarity: "0.75", offset: "0, 0"});
  });
  it('no params', () => {
    expect(parse_pattern('Pattern("foo.png")'))
    .toEqual({name: "foo.png", similarity: "0.75", offset: "0, 0"});
  });
  it('one param', () => {
    expect(parse_pattern('Pattern("foo.png").similarity(0.40)'))
    .toEqual({name: "foo.png", similarity: "0.40", offset: "0, 0"});
  });
  it('multiple params', () => {
    expect(parse_pattern('Pattern("foo.png").similarity(0.40).offset(5, 6)'))
    .toEqual({name: "foo.png", similarity: "0.40", offset: "5, 6"});
  });
});

describe('ImagePropsView::write_pattern', () => {
  it('raw string', () => {
    expect(write_pattern({name: "foo.png", similarity: "0.75", offset: "0, 0"}))
    .toEqual('"foo.png"');
  });
  it('one param', () => {
    expect(write_pattern({name: "foo.png", similarity: "0.40", offset: "0, 0"}))
    .toEqual('Pattern("foo.png").similarity(0.40)');
  });
  it('multiple params', () => {
    expect(write_pattern({name: "foo.png", similarity: "0.40", offset: "4, 2"}))
    .toEqual('Pattern("foo.png").similarity(0.40).offset(4, 2)');
  });
});
