const initialState = {
    coords: {
        x: 0,
        y: 0,
        z: 1
    }
};

const reducer = function (state = initialState, action) {
    switch (action.type) {
        case 'viewport-move':
            return {
                ...state, coords: action.payload
            }
        default:
            return state;
    }
};

export { reducer };