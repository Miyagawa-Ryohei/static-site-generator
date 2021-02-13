import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {Main} from "./ui/main";

const App: React.FC = () => {
    return <Main />;
};

ReactDOM.render(<App />, document.getElementById('root'));