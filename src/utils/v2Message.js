const { MessageFlags } = require("discord.js");

function makeText(content) {
  return { type: 10, content };
}

function makeSeparator(spacing = 1, divider = true) {
  return { type: 14, spacing, divider };
}

function v2Message({ title, sections = [], lines = [], components = [], noAccent = false }) {
  const containerChildren = [];

  if (title) {
    containerChildren.push(makeText(`# ${title}`));
    containerChildren.push(makeSeparator(2, true));
  }

  for (const section of sections) {
    if (section.heading) {
      containerChildren.push(makeText(`## ${section.heading}`));
    }
    if (section.body) {
      containerChildren.push(makeText(section.body));
    }
    containerChildren.push(makeSeparator(1, true));
  }

  if (lines.length > 0) {
    containerChildren.push(makeText(lines.join("\n")));
  }

  for (const component of components) {
    if (component && typeof component.toJSON === "function") {
      containerChildren.push(component.toJSON());
    } else {
      containerChildren.push(component);
    }
  }

  // Avoid trailing separator for cleaner visual output.
  while (
    containerChildren.length > 0 &&
    containerChildren[containerChildren.length - 1].type === 14
  ) {
    containerChildren.pop();
  }

  const container = {
    type: 17,
    components: containerChildren,
  };

  if (!noAccent) {
    container.accent_color = null;
  }

  return {
    flags: MessageFlags.IsComponentsV2,
    components: [container],
  };
}

function ephemeralV2Message(payload) {
  return {
    ...v2Message(payload),
    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral,
  };
}

module.exports = {
  v2Message,
  ephemeralV2Message,
};
