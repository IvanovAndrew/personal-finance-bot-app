import { Children, type CSSProperties, type FC, Fragment, type ReactNode } from "react";

import { theme } from "../App.styles.ts";

interface CardProps {
    children: ReactNode;
    padding?: number | string;
    style?: CSSProperties;
}

/** Flat surface: a fill one step lighter than the page, no border. */
export const Card: FC<CardProps> = ({ children, padding = 16, style }) => (
    <div
        style={{
            background: theme.colors.surface,
            borderRadius: theme.colors.radiusCard,
            padding,
            boxSizing: "border-box",
            ...style,
        }}
    >
        {children}
    </div>
);

export const Divider: FC<{ inset?: number }> = ({ inset = 0 }) => (
    <div style={{ height: 1, marginLeft: inset, background: theme.colors.border, opacity: 0.6 }} />
);

interface ListGroupProps {
    children: ReactNode;
    /** Left inset of the dividers: 68 aligns with the text after a 40 px avatar. */
    inset?: number;
}

/** One surface holding a list of rows separated by inset hairlines. */
export const ListGroup: FC<ListGroupProps> = ({ children, inset = 68 }) => (
    <Card padding={0} style={{ overflow: "hidden" }}>
        {Children.toArray(children).map((child, i) => (
            <Fragment key={i}>
                {i > 0 && <Divider inset={inset} />}
                {child}
            </Fragment>
        ))}
    </Card>
);
