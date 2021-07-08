const initialState = {
    userMode: 'move',
    coords: {
        x: 0,
        y: 0,
        z: 1
    },
    figures: []
};

const reducer = function (state = initialState, action) {
    switch (action.type) {
        case 'viewport-move':
            return {
                ...state, coords: action.payload
            }
        case 'add-figure':
            return {
                ...state, figures: [...state.figures, action.payload]
            }
        case 'user-change-mode':
            return {
                ...state, userMode: action.payload
            }
        default:
            return state;
    }
};

export { reducer };