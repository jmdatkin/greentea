import Camera from './camera';
import Canvas from './canvas';
import Text from './text';
import SocketIO from './network-controller';
import { $, $$ } from './util';
import settings from './settings';
import Vector from './vector';


var InputField = (function (camera, canvas) {

    const element = document.createElement('input');
    element.maxLength = 255;
    element.style.fontSize = `${settings.fontSize}px`;
    element.style.fontFamily = settings.fontFace;
    element.classList.add("TextInput");

    var x = 0,
        y = 0;

    const set = (newX, newY) => {
        x = newX;
        y = newY;
        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
    };

    const hide = () => element.classList.add("hidden");
    const unhide = () => element.classList.remove("hidden");

    const focus = () => element.focus();
    const unfocus = () => element.blur();

    const setColor = newColor => {
        element.style.color = Colors.toRGB(newColor);
    };

    hide();
    $(".canvas-wrapper").appendChild(element)

    //Evt handler for textarea defocus
    const blurHandler = function (e) {
        element.value = '';     //Clear inputted text
        hide();                 //Hide form (user has submitted)
    };

    const submitHandler = function () {

        let inputCoords = new Vector(InputField.x, InputField.y, camera.coords.z);

        // let tempCoords = new Vector(camera.coords.x - camera.midpoint.x, camera.coords.y - camera.midpoint.y, camera.coords.z);

        // let mtx = tempCoords.getInverseTransform();

        // inputCoords.applyTransform(mtx);
                
        // let textObj = new Text(inputCoords.x, inputCoords.y, inputCoords.z,
            // InputField.value, ColorPicker.selectedColor.color);
        let textObj = new Text(inputCoords.x + camera.coords.x,
            InputField.y + camera.coords.y,
            camera.coords.z,
            InputField.value, ColorPicker.selectedColor.color);
        console.log(textObj);
        SocketIO.emit("text", textObj);
        InputField.unfocus();           //Unfocus input area
    };

    //Check for enter
    const keypressHandler = function (e) {
        if (e.code === 'Enter' || e.code === 'NumpadEnter')
            submitHandler();
    };

    element.addEventListener("blur", blurHandler);
    element.addEventListener("submit", submitHandler);
    element.addEventListener("keypress", keypressHandler);

    return {
        element: element,
        set: set,
        hide: hide,
        unhide: unhide,
        focus: focus,
        unfocus: unfocus,
        setColor: setColor,
        get value() {
            return element.value;
        },
        get x() {
            return x;
        },
        get y() {
            return y;
        }
    };
})(Camera, Canvas);

const ColorPicker = (function () {
    const swatches = Array.from($$(".color-swatch"));
    const SquareSize = 25;

    let selectedColor = {
        _color: "black",
        get color() {
            return this._color;
        },
        set color(x) {
            this._color = x;
            InputField.setColor(x);
        }
    }

    swatches.forEach(swatch => {
        let thisColor = swatch.dataset.color;
        swatch.style.backgroundColor = settings.colors.toRGB(thisColor);
        swatch.style.width = `${SquareSize}px`;
        swatch.style.height = `${SquareSize}px`;
        swatch.addEventListener("click", (e) => {
            swatches.forEach(s => {
                s.classList.remove("color-swatch-selected");
            });
            e.target.classList.add("color-swatch-selected");
            // selected = e.target;
            selectedColor.color = thisColor;
        });
    });

    return {
        selectedColor: selectedColor
    };
})();

const UsersList = (function () {
    const listElement = $("#connected-users-list");

    let userList = {}

    const updateUsers = function (newUsers) {
        if (newUsers)
            userList = newUsers;
        listElement.innerHTML = '';
        Object.keys(userList).forEach(userId => {
            let li = document.createElement('li');
            let nickString = userList[userId];

            if (userId === UserId) {
                nickString += " (YOU)";
                // li.style.color = 'blue';   
            }

            li.textContent = nickString;
            listElement.appendChild(li);
        });
    }

    // SocketIO.addListener("userUpdate", (data) => updateUsers(data));

    return {
        updateUsers: updateUsers
    };
})();

const NicknameField = (function () {
    const inputElement = $("#nickname-field");
    const editButton = $("#nickname-toggle-edit");

    let editable = false;
    let nick = "";
    inputElement.value = '';

    const enableEdit = () => {
        inputElement.classList.add("editable");
        inputElement.removeAttribute("disabled");
        editable = true;
    };

    const disableEdit = () => {
        inputElement.classList.remove("editable");
        inputElement.setAttribute("disabled", "");
        editable = false;
    }

    const editClick = () => {
        enableEdit();
        inputElement.focus();
        inputElement.select();
    };

    const nicknameBlur = e => {
        disableEdit();
        UserNick = nick;
        SocketIO.nicknameUpdate();
    };

    const nicknameChange = e => {
        nick = e.target.value;
    };

    const nicknameSubmit = e => {
        if (e.code === 'Enter' || e.code === 'NumpadEnter')
            e.target.blur();
    }

    editButton.addEventListener("click", editClick);
    inputElement.addEventListener("change", nicknameChange);
    inputElement.addEventListener("blur", nicknameBlur);
    inputElement.addEventListener("keydown", nicknameSubmit);

})();

export { InputField, ColorPicker, UsersList, NicknameField };