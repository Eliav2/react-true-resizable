# react-true-resizable

A resizable that just work as you would expect!

there are some other resizable libraries for react out there
like [react-resizable](https://www.npmjs.com/package/react-resizable)
or [re-resizable](https://www.npmjs.com/package/re-resizable) or even the excellent
library [react-rnd](https://www.npmjs.com/package/re-resizable).
, but all of them inject style to the children component to make them resizable therefore their behavior is not
consistent between different [positions style](https://developer.mozilla.org/en-US/docs/Web/CSS/position)(
absolute,relative,static).

this library uses different approach, the only injected style is `box-sizing` (for consistency), and the handlers are placed in absolute position relative to their own div, so it would work no matter what style is being used with the resizable children.

# Quick Start

```tsx

```


wrapper component which provides resize handle around html element.

note: do not wrap around complex react component directly, only simple ones - such as ```div,span,etc```.

for example, do this:

```tsx
<Resizable>
    <div>hey there!</div>
</Resizable>
```

but not this:

```tsx
const MyDiv = () => <div>hey there!</div>;
<Resizable><MyDiv/></Resizable> // error
```

this is because a React component can not access his child's properties if it's a complex React component because the
React Element has not been created yet(it's a function or an object).


