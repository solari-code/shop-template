import { Fragment } from "react";

// Renders a config text, turning each line break (\n) into a <br />.
export default function MultilineText({ text }) {
    return String(text ?? "").split("\n").map((line, i) => (
        <Fragment key={i}>
            {i > 0 && <br />}
            {line}
        </Fragment>
    ));
}
