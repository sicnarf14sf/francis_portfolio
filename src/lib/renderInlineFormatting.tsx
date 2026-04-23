import { Fragment, type JSX, type ReactNode } from "react";

const TAG_PATTERN = /(<\/?(?:i|em|b|strong)>)/gi;

export const renderInlineFormatting = (value: string): ReactNode => {
  const tokens = value.split(TAG_PATTERN).filter(Boolean);
  let italicDepth = 0;
  let boldDepth = 0;

  return tokens.map((token, index): JSX.Element => {
    const normalized = token.toLowerCase();

    if (normalized === "<i>" || normalized === "<em>") {
      italicDepth += 1;
      return <Fragment key={`tag-open-${index}`} />;
    }

    if (normalized === "</i>" || normalized === "</em>") {
      italicDepth = Math.max(0, italicDepth - 1);
      return <Fragment key={`tag-close-${index}`} />;
    }

    if (normalized === "<b>" || normalized === "<strong>") {
      boldDepth += 1;
      return <Fragment key={`tag-open-${index}`} />;
    }

    if (normalized === "</b>" || normalized === "</strong>") {
      boldDepth = Math.max(0, boldDepth - 1);
      return <Fragment key={`tag-close-${index}`} />;
    }

    let content: ReactNode = token;

    if (italicDepth > 0) {
      content = <em>{content}</em>;
    }

    if (boldDepth > 0) {
      content = <strong>{content}</strong>;
    }

    return <Fragment key={`text-${index}`}>{content}</Fragment>;
  });
};
