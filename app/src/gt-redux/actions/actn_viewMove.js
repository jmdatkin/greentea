const viewportMove = (payload) => {
    return {
        type: 'viewport-move',
        payload: payload
    };
};

export { viewportMove };