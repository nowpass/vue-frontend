<template>
    <div id="lab">
        Lab
    </div>
</template>

<script>
    /**
     * Just for tests
     */
    export default {
        name: "lab",
        created(){
            this.showPopup('50%', '40%');
        },
        methods: {
            showPopup: function (top, left) {
                console.log('Showing popup for element choose')

                // Create a new container
                let popup = document.createElement("div");

                // Fixed
                Object.assign(popup.style, {
                    position: 'absolute',
                    background: '#f1f1f1',
                    width: '300px',
                    height: '300px',
                    border: '1px solid #ccc',
                    'border-radius': '5px',
                    padding: '10px',
                    top: top,
                    left: left
                });

                let heading = document.createElement('h3');
                heading.innerHTML = 'Login as';

                let content = document.createElement('div');

                for (let i = 0; i < this.elements.length; i++) {
                    let element = this.elements[i];

                    let elementDiv = document.createElement('div');

                    elementDiv.style.borderBottom = '1px solid #ccc';

                    elementDiv.innerHTML = '<strong>' + element.title + '</strong>';

                    content.appendChild(elementDiv);
                }

                // Ordering
                popup.appendChild(heading);
                popup.appendChild(content);

                // Append to body
                document.body.appendChild(popup);
            }
        },
        data() {
            return {
                elements: [
                    {
                        id: 42,
                        title: 'Login 1',
                        url: 'http://www.test.de',
                        username: 'myuser'
                    },
                    {
                        id: 43,
                        title: 'Login 2',
                        url: 'http://www.test.de',
                        username: 'myuser42'
                    },
                ]
            }
        }
    }
</script>
