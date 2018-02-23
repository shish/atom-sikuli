'use babel';

export const pattern_single = /"([a-zA-Z0-9_-]+\.png)"|Pattern\("([a-zA-Z0-9_-]+\.png)"\)((?:\.[a-z]+\([0-9,\. ]*\))*)/;
export const pattern_multi = RegExp(pattern_single, "g")

const default_pattern = {
  similarity: "0.75",
  offset: "0, 0",
};

export function parse_pattern(text) {
  let matches = text.match(pattern_single);
  let pattern = {
    name: matches[1] || matches[2],
    similarity: default_pattern.similarity,
    offset: default_pattern.offset,
  };
  let argRe = /\.([a-z]+)\(([^)]*)\)/g;
  while ((argMatch = argRe.exec(matches[3])) !== null) {
    pattern[argMatch[1]] = argMatch[2];
  }
  return pattern;
}

export function write_pattern(pattern) {
  function changed(attr) {
    return pattern[attr] != default_pattern[attr];
  }

  let params = "";
  if(changed("similarity")) {
    params += ".similarity(" + pattern.similarity + ")";
  }
  if(changed("offset")) {
    params += ".offset(" + pattern.offset + ")";
  }

  let text = '"' + pattern.name + '"';
  if(params != "") {
    text = "Pattern(" + text + ")" + params;
  }
  return text;
}
