document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('.content');
    const mainBtn = document.querySelector('.nav-main-btn');
    const fastMenu = document.querySelector('.fast-menu');
    const mainCont = document.querySelector('.main_content');
    const addDevice = document.querySelector('.add-device_content');
    const addDataset = document.querySelector('.add-dataset_content');
    const sideBtns = document.querySelectorAll('.sidebar_btn');
    const addDeviceBtns = document.querySelectorAll('.add-device_btn');
    const addDatasetBtns = document.querySelectorAll('.add-dataset_btn');
    const profileLink = document.querySelector('.main__header_profile-link');
    const accountSettings = document.querySelector('.account__settings');
    const profileMail = document.getElementById('profile__mail');
    const profileLogoutBtnBtn = document.querySelector('.profile__logout');
    const addDatasetSubmitBtn = document.getElementById('add-dataset__submit-button');
    const deviceTablePage = document.querySelector('.device-table');
    const deviceTablOpenBtn = document.querySelectorAll('.device-table-open_btn');
    const dsSettingsSubmitBtn = document.getElementById('dataset-settings__submit-btn');
    const dsSettingsPage = document.querySelector('.dataset-settings');
    const dsSettingsBtn = document.querySelectorAll('.set-settings');
    const addDeviceForm = document.getElementById('add-device_form');


    deviceTablOpenBtn.forEach(button => {
        button.addEventListener("click", function() {
            const active_section = document.querySelector('.active');
            active_section.classList.add("hidden-section");
            active_section.classList.remove("active");
            deviceTablePage.classList.remove('hidden-section');
            deviceTablePage.classList.add('active');
            showDeviceTable('table');
        });
    });

    async function updateDatasetsSelect() {
        const datasets = await fetchAllDatasets();
        const dsSettingsSelect = document.getElementById("dataset-settings__select_dataset");
    
        if (datasets.length > 0) {
            updateDatasetSelect(datasets, dsSettingsSelect);
        }
    }
    
    

    dsSettingsBtn.forEach(button => {
        button.addEventListener('click', function() {
            const activeSection = document.querySelector('.active');
            if (activeSection) {
                activeSection.classList.add('hidden-section');
                activeSection.classList.remove('active');
            }
            dsSettingsPage.classList.remove('hidden-section');
            dsSettingsPage.classList.add('active');
            
            updateDatasetsSelect(); 
        });
    });
    

    dsSettingsSubmitBtn.addEventListener('click', function(event) {
        event.preventDefault();
        const datasetSelect = document.getElementById('dataset-settings__select_dataset');
        const userEmailInput = document.getElementById('dataset-settings__email');
        const accessLevelSelect = document.getElementById('dataset-settings__select_access');

        const targetDatasetId = datasetSelect.value;
        const targetUserEmail = userEmailInput.value;
        const targetAccessLevel = accessLevelSelect.value;

        if (!targetDatasetId || !targetUserEmail || !targetAccessLevel) {
            showStatusMessage('Заполните все поля', false);
            return;
        }

        const requestData = {
            target_dataset_id: parseInt(targetDatasetId),
            target_user_email: targetUserEmail,
            target_access_level: targetAccessLevel
        };

        fetch('https://iotdatahub.online/iot_lk/api/user/share_dataset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === '0') {
                showStatusMessage('Доступ к набору данных успешно предоставлен!', true);
            } else if (data.error) {
                showStatusMessage(`Ошибка: ${data.error}`, false);
            }
        })
        .catch(error => {
            showStatusMessage('Произошла ошибка при отправке запроса', false);
            console.error('Ошибка:', error);
        });
    });


    profileLink.addEventListener('click', function(event) {
        event.preventDefault();
        accountSettings.classList.toggle('hidden');
    });

    profileLogoutBtnBtn.addEventListener('click', function(){
        // if (userId) {localStorage.removeItem('userId');}
        // if (availableDatasets) {localStorage.removeItem('availableDatasets');}
        if(token) {
            localStorage.removeItem('token');
        }
        window.location.href = 'login.html';
    });

    deviceTablOpenBtn.forEach(button => {
        button.addEventListener("click", function() {
            const active_section = document.querySelector('.active');
            active_section.classList.add("hidden-section");
            active_section.classList.remove("active");
            deviceTablePage.classList.remove('hidden-section');
            deviceTablePage.classList.add('active');
        });
    });

    addDeviceBtns.forEach(button => {
        button.addEventListener("click", function() {
            const active_section = document.querySelector('.active');
            active_section.classList.add("hidden-section");
            active_section.classList.remove("active");
            addDevice.classList.remove('hidden-section');
            addDevice.classList.add('active');
        });
    });

    addDatasetBtns.forEach(button => {
        button.addEventListener("click", function() {
            const active_section = document.querySelector('.active');
            active_section.classList.add("hidden-section");
            active_section.classList.remove("active");
            addDataset.classList.remove('hidden-section');
            addDataset.classList.add('active');
        });
    });

    sideBtns.forEach(button => {
        button.addEventListener("click", function() {
            const active_section = document.querySelector('.active');
            active_section.classList.add("hidden-section");
            active_section.classList.remove("active");
            mainCont.classList.remove("hidden-section");
            mainCont.classList.add("active");
        });
    });

    mainBtn.addEventListener("click", function() {
        const active_section = document.querySelector('.active');
        active_section.classList.add("hidden-section");
        active_section.classList.remove("active");
        fastMenu.classList.remove("hidden-section");
        fastMenu.classList.add("active");
    });

    const token = localStorage.getItem('token');

    if (!token) {
        localStorage.removeItem('userId');
        localStorage.removeItem('availableDatasets');
        window.location.href = 'login.html';
    } else {
        fetch('https://iotdatahub.online/iot_lk/token/info', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Unauthorized');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                throw new Error('Unauthorized');
            }
            console.log('User Info:', data);

            const userEmail = data.data.sub;
            profileMail.innerHTML += userEmail;
            fetchKits();


        })
        .catch(error => {
            console.error('Ошибка:', error);
            localStorage.removeItem('userId');
            localStorage.removeItem('availableDatasets');
            window.location.href = 'login.html';
        });
    }

    async function fetchKits() {
        try {
            const response = await fetch('https://iotdatahub.online/iot_lk/api/user/view_all_available_datasets', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const response1 = await fetch('https://iotdatahub.online/iot_lk/api/get_user_id', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });
            
            let userData = await response1.json();
            const kitsData = await response.json();
    
            localStorage.setItem('availableDatasets', JSON.stringify(kitsData.result));
            localStorage.setItem('userId', userData.user_id);
    
            console.log(kitsData.result);
            const selectElement = document.getElementById('add-device_dataset_choice');
            updateDatasetSelect(kitsData.result, selectElement);
            updateAvailableKits(kitsData.result);
            showDeviceTable('menu');
            updateMyKits(kitsData.result, userData.user_id);
        } catch (error) {
            console.error('Error fetching kits:', error);
        }
    }
    

    function updateMyKits(kits, user_id) {
        const myContainer = document.getElementById('mine');
        myContainer.innerHTML = ''; 
    
        if (kits.length === 0) {
            myContainer.innerHTML = '<p>Нет доступных наборов данных</p>';
            return;
        }
    
        kits.forEach(kit => {
            if (user_id == kit.creator_id) {
                const cardDiv = document.createElement('div');
                const a = document.createElement('a');
                cardDiv.classList.add('card');
                cardDiv.classList.add('card-body');
                a.classList.add('dropdown-item');
                a.href = '#';
                a.textContent = kit.dataset_name;

                a.addEventListener('click', function(event) {
                    event.preventDefault();
                    openDatasetData(kit.dataset_name, kit.id);
                });
    
                cardDiv.appendChild(a);
                myContainer.appendChild(cardDiv);
            }
        });
    }
    

    function updateAvailableKits(kits) {
        const availableContainer = document.getElementById('available');
        availableContainer.innerHTML = ''; 
    
        if (kits.length === 0) {
            availableContainer.innerHTML = '<p>Нет доступных наборов данных</p>';
            return;
        }
    
        kits.forEach(kit => {
            const cardDiv = document.createElement('div');
            const a = document.createElement('a');
            cardDiv.classList.add('card');
            cardDiv.classList.add('card-body');
            a.classList.add('dropdown-item');
            a.classList.add('menu-datasets');
            a.href = '#';
            a.textContent = kit.dataset_name;
    
            a.addEventListener('click', function(event) {
                event.preventDefault();
                openDatasetData(kit.dataset_name, kit.id);
            });
    
            cardDiv.appendChild(a);
            availableContainer.appendChild(cardDiv);
        });
    }
    

    function updateDatasetSelect(kits, selectElement) {
        selectElement.innerHTML = '<option selected>Выберите набор...</option>';

        kits.forEach(kit => {
            const option = document.createElement('option');
            option.value = kit.id; 
            option.textContent = kit.dataset_name; 
            selectElement.appendChild(option);
        });
    }

    function showStatusMessage(errorMessage, isSuccess) {
        var $jq = jQuery.noConflict();
        const $errorMesDiv_addDataset = $('#status__message');
        $errorMesDiv_addDataset.text(errorMessage);
        $errorMesDiv_addDataset.removeClass();
        
        if (isSuccess === true) {
            $errorMesDiv_addDataset.addClass("status__message status__message_success");
        } else {$errorMesDiv_addDataset.addClass("status__message status__message_fail");}

        $errorMesDiv_addDataset.hide().slideDown().delay(3000).slideUp();

    }
    
    addDatasetSubmitBtn.addEventListener('click', function(event) {
        event.preventDefault();

        const datasetName = document.getElementById('add-dataset_dataset-name_input').value;

        if (!datasetName) {
            showStatusMessage('Введите название набора', false);
            return;
        }

        const requestData = {
            dataset_name: datasetName
        };

        fetch('https://iotdatahub.online/iot_lk/api/dataset/add_new_dataset', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === '0') {
                showStatusMessage('Набор успешно добавлен!', true);
            } else {
                showStatusMessage((data.error || 'Неизвестная ошибка'), false);
            }
        })
        .catch(error => {
            showStatusMessage('Произошла ошибка при отправке запроса', false);
        });
    });

    addDeviceForm.addEventListener('submit', function(event) {
        event.preventDefault();
    
        const deviceName = document.getElementById('add-device_device-name_input').value;
        const datasetId = document.getElementById('add-device_dataset_choice').value;
        const parameterType = document.getElementById('add-device_device-type_input').value;
    
        if (!deviceName || !datasetId || !parameterType) {
            showStatusMessage('Заполните все поля', false);
            return;
        }
        const requestData = {
            device_model: deviceName,
            dataset_id: parseInt(datasetId),
            parameter_type: parameterType
        };
    
        fetch('https://iotdatahub.online/iot_lk/api/device/add_new_device', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token 
            },
            body: JSON.stringify(requestData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === '0') {
                document.querySelector('form').reset();
                console.log(data);
                const resultP = document.getElementById('add-device__result_data');
                resultP.textContent = '';
                resultP.innerHTML = `Поздравляем, устройство добавлено!<br>
                Вы можете отправлять данные с устройства, используя HTTP GET-запрос на следующий адрес:<br>
                http://iotdatahub.online/iot_lk/api/device/collect_device_data<br>
                С параметрами device_id (ID устройства), key (ключ добавления), value (значение, которое хотите записать)<br><br>
                
                Например, для добавленного устройства:<br>
                http://iotdatahub.online/iot_lk/api/device/collect_device_data?device_id=${data.device_id}&key=${data.key}&value=0<br><br>
                
                Так же вы можете использовать HTTP POST запрос на адрес:<br>
                http://iotdatahub.online/iot_lk/api/device/collect_device_data<br>
                В теле запроса необходимо передать данные в формате JSON:<br><br>
                {<br>
                    "device_id" : ${data.device_id},<br>
                    "key": "${data.key}",<br>
                    "value": "0"<br>
                }`;
                fetch(`https://iotdatahub.online/iot_lk/api/device/collect_device_data?device_id=${data.device_id}&key=${data.key}&value=0`)
                .then(response => response.json())
                .then(data => {
                    if (data.status === '0') {showStatusMessage('Устройство успешно добавлено! По умолчанию применено значение 0', true);} else {showStatusMessage('Что-то пошло не так!', false);}
                });
            } else {
                showStatusMessage((data.error || 'Неизвестная ошибка'), false);
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            showStatusMessage('Произошла ошибка при отправке запроса:', false);
        });
    });


    async function fetchAllDatasets() {
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('Токен не найден в localStorage.');
            showStatusMessage('Ошибка: пользователь не авторизован', false);
            return;
        }

        try {
            const response = await fetch('https://iotdatahub.online/iot_lk/api/user/view_all_available_datasets', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Unauthorized: InvalidToken');
                }
                throw new Error(`Ошибка: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.result && data.result.length > 0) {
                console.log('Наборы данных:', data.result);
                return data.result;
            } else {
                console.log('Наборов данных не найдено');
                showStatusMessage('Нет доступных наборов данных.', false);
                return [];
            }
        } catch (error) {
            console.error('Ошибка получения наборов данных:', error);
            showStatusMessage(`Ошибка: ${error.message}`, false);
        }
    }

    
    function parseDate(dateString) {
        return new Date(dateString);
    }


    function openDatasetData(datasetName, datasetId) {
        const active_section = document.querySelector('.active');
        const datasetContent = document.querySelector('.dataset-content');
        const dsNameId = document.querySelector('.dataset-content__name-id');
        const analysisBtn = document.getElementById('dataset-content__analysis-btn');
        
        
        // Очистка предыдущих обработчиков событий
        const newAnalysisBtn = analysisBtn.cloneNode(true);
        analysisBtn.replaceWith(newAnalysisBtn);

        newAnalysisBtn.addEventListener("click", function(event) {
            event.preventDefault();
            analysis_page(datasetId);  // Переход к анализу для текущего датасета
        });

        function changeNameId() {
            dsNameId.textContent = '';
            dsNameId.textContent = `Имя набора: ${datasetName}, id набора: ${datasetId}`;
        }
    
        changeNameId();

        
    
        active_section.classList.add("hidden-section");
        active_section.classList.remove("active");
        datasetContent.classList.remove('hidden-section');
        datasetContent.classList.add("active");
    
        const graphContainer = document.querySelector('.dataset-content__devices_wrapper');
        graphContainer.innerHTML = '';
    
        const selectGraphType = document.createElement('div');
        selectGraphType.id = 'dataset-content_select-graph';
        selectGraphType.className = 'mb-4';
        
        const options = [
            { value: 'pie', text: 'Круговая диаграмма' },
            { value: 'horizontalBar', text: 'Гистограмма' },
            { value: 'doughnut', text: 'Кольцевая диаграмма' },
            { value: 'bar', text: 'Столбчатая диаграмма' },
            { value: 'line', text: 'Линейный график' },
            { value: 'bubble', text: 'Пузырьковая диаграмма' }
        ];
    
        options.forEach(optionData => {
            const checkboxLabel = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = optionData.value;
            checkbox.className = 'graph-checkbox';
    
            checkboxLabel.appendChild(checkbox);
            checkboxLabel.append(optionData.text);
            selectGraphType.appendChild(checkboxLabel);
            selectGraphType.appendChild(document.createElement('br'));
        });
    
        graphContainer.appendChild(selectGraphType);
    
        fetch(`https://iotdatahub.online/iot_lk/api/user/view_dataset_data?dataset_id=${datasetId}`, {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        })
        .then(response => response.json())
        .then(data => {
            const deviceDataMap = {};
            let maxDataCount = 0;
    
            const now = Date.now();
            const last24Hours = now - 24 * 60 * 60 * 1000;
            let globalTimestamps = [];
    
            data.result.forEach(device => {
                const deviceId = device.device_id;
                const sendingDate = parseDate(device.data_sending_date);
                const value = device.value;
    
                if (sendingDate >= last24Hours) {
                    if (!deviceDataMap[deviceId]) {
                        deviceDataMap[deviceId] = {
                            device_model: device.device_model || `Устройство ${deviceId}`,
                            parameter_type: device.parameter_type,
                            key: device.key,
                            values: []
                        };
                    }
    
                    deviceDataMap[deviceId].values.push([sendingDate, parseFloat(value)]);
                    globalTimestamps.push(sendingDate);
                    maxDataCount = Math.max(maxDataCount, deviceDataMap[deviceId].values.length);
                }
            });
    
            globalTimestamps = Array.from(new Set(globalTimestamps)).sort((a, b) => a - b);
    
            function formatTimeLabel(timestamp) {
                const date = new Date(timestamp);
                return date.toLocaleTimeString(); 
            }
    
            function getRandomRadius() {
                const minRadius = 3;
                const maxRadius = 15;
                return Math.floor(Math.random() * (maxRadius - minRadius + 1)) + minRadius;
            }
    
            // Создание контейнера для графиков
            function createGraphTemplate(graphId) {
                const graphDiv = document.createElement('div');
                graphDiv.className = 'graph-container';
    
                const chartCanvas = document.createElement('canvas');
                chartCanvas.id = graphId;
                chartCanvas.style.width = "400px";
                chartCanvas.style.height = "200px";
    
                graphDiv.appendChild(chartCanvas);
                graphContainer.appendChild(graphDiv);
    
                return chartCanvas;
            }
    
            // Рисование выбранных графиков
            function drawSelectedGraphs() {
                // Очищаем все ранее нарисованные графики
                graphContainer.querySelectorAll('.graph-container').forEach(graphDiv => graphDiv.remove());
    
                // Получаем все выбранные графики
                const selectedGraphs = [...document.querySelectorAll('.graph-checkbox:checked')].map(checkbox => checkbox.value);
    
                // Проходим по каждому выбранному графику
                selectedGraphs.forEach(selectedGraph => {
                    let labels = globalTimestamps.map(formatTimeLabel);
                    const values = []; 
                    const deviceLabels = [];
    
                    if (selectedGraph === 'bubble') {
                        Object.values(deviceDataMap).forEach(device => {
                            const deviceSeries = [];
    
                            device.values.forEach(point => {
                                const radius = getRandomRadius();
                                deviceSeries.push([point[0], point[1], radius]);
                            });
    
                            if (deviceSeries.length > 0) {
                                values.push(deviceSeries);
                                deviceLabels.push(device.device_model); 
                            }
                        });
    
                        const graphId = 'graph-' + Math.random().toString(36).substring(2, 9);
                        const chartCanvas = createGraphTemplate(graphId);
    
                        let diagram_bubble = new Diagram(graphId, 'bubble', deviceLabels, values, [], 'time');
                        diagram_bubble.draw();
                    } else if (selectedGraph === 'line') {
                        Object.values(deviceDataMap).forEach(device => {
                            const deviceSeries = [];
    
                            device.values.forEach(point => {
                                const formattedTime = formatTimeLabel(point[0]);
                                deviceSeries.push([formattedTime, point[1]]);
                            });
    
                            if (deviceSeries.length > 0) {
                                values.push(deviceSeries);
                                deviceLabels.push(device.device_model);
                            }
                        });
    
                        const graphId = 'graph-' + Math.random().toString(36).substring(2, 9);
                        const chartCanvas = createGraphTemplate(graphId);
    
                        let diagram_line = new Diagram(graphId, 'line', deviceLabels, values, labels);
                        diagram_line.draw();
                    } else {
                        Object.values(deviceDataMap).forEach(device => {
                            const lastValue = parseFloat(device.values[device.values.length - 1][1]);
                            if (!isNaN(lastValue)) {
                                deviceLabels.push(device.device_model);
                                values.push(lastValue);
                            }
                        });
    
                        const graphId = 'graph-' + Math.random().toString(36).substring(2, 9);
                        const chartCanvas = createGraphTemplate(graphId);
    
                        if (selectedGraph === 'pie') {
                            let diagram_pie = new Diagram(graphId, 'pie', deviceLabels, values);
                            diagram_pie.draw();
                        } else if (selectedGraph === 'horizontalBar') {
                            let diagram_horizontalBar = new Diagram(graphId, 'horizontalBar', deviceLabels, values);
                            diagram_horizontalBar.draw();
                        } else if (selectedGraph === 'doughnut') {
                            let diagram_doughnut = new Diagram(graphId, 'doughnut', deviceLabels, values);
                            diagram_doughnut.draw();
                        } else if (selectedGraph === 'bar') {
                            let diagram_bar = new Diagram(graphId, 'bar', deviceLabels, values);
                            diagram_bar.draw();
                        }
                    }
                });
            }
    
            // Слушаем изменения в списке чекбоксов и рисуем графики
            selectGraphType.addEventListener('change', drawSelectedGraphs);
        })
        .catch(error => {
            console.error('Ошибка получения данных:', error);
        });
    }
    
    
    function analysis_page(datasetId) {
        const active_section = document.querySelector('.active');
        const analysisPage = document.querySelector('.analysis');
        const deviceSelect = document.getElementById('analysis__device-select');
        const methodSelect = document.getElementById('analysis__method-select');
        const secondDeviceSelect = document.getElementById('analysis__second_device_select');
        const timeInput = document.getElementById('analysis__time_input');
        const secondDeviceTitle = document.getElementById('analysis__second_device_title');
        const timeTitle = document.getElementById('analysis__time_title');
        let resultContainer = document.getElementById('analysis__result');
    
        if (resultContainer) {
            resultContainer.textContent = '';
        } else {
            resultContainer = document.createElement('p');
            resultContainer.id = 'analysis__result';
            resultContainer.classList.add("text-center");
            resultContainer.classList.add("mt-4");
            analysisPage.appendChild(resultContainer);
        }
    
        active_section.classList.add("hidden-section");
        active_section.classList.remove("active");
        analysisPage.classList.remove('hidden-section');
        analysisPage.classList.add("active");
    
        deviceSelect.innerHTML = '';
        secondDeviceSelect.innerHTML = '';
        secondDeviceTitle.classList.add('hidden');
        secondDeviceSelect.classList.add('hidden');
        timeTitle.classList.add('hidden');
        timeInput.classList.add('hidden');
        resultContainer.textContent = '';
    
        // Загрузка списка устройств из набора данных
        fetch(`https://iotdatahub.online/iot_lk/api/user/view_dataset_data?dataset_id=${datasetId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            const deviceDataMap = {};
            deviceSelect.innerHTML = '';
            secondDeviceSelect.innerHTML = '';
    
            data.result.forEach(device => {
                const deviceId = device.device_id;
                const deviceModel = device.device_model || `Устройство ${deviceId}`;
                
                if (!deviceDataMap[deviceId]) {
                    deviceDataMap[deviceId] = deviceModel;
    
                    const option = document.createElement('option');
                    option.value = deviceId;
                    option.textContent = deviceModel;
                    deviceSelect.appendChild(option);
    
                    const optionClone = option.cloneNode(true);
                    secondDeviceSelect.appendChild(optionClone);
                }
            });
        })
        .catch(error => {
            resultContainer.classList.add('reg__error-text');
            resultContainer.textContent = `Ошибка при получении данных устройств: ${error.message}`;
        });
    
        methodSelect.addEventListener('change', () => {
            const selectedMethod = methodSelect.value;
    
            secondDeviceTitle.classList.add('hidden');
            secondDeviceSelect.classList.add('hidden');
            timeTitle.classList.add('hidden');
            timeInput.classList.add('hidden');
    
            if (selectedMethod === 'korr') {
                secondDeviceTitle.classList.remove('hidden');
                secondDeviceSelect.classList.remove('hidden');
            } else if (selectedMethod === 'regr') {
                timeTitle.classList.remove('hidden');
                timeInput.classList.remove('hidden');
            }
        });
    
        function performAnalysis() {
            const selectedMethod = methodSelect.value;
            const deviceId = deviceSelect.value;
    
            if (!deviceId) {
                resultContainer.classList.add('reg__error-text');
                resultContainer.textContent = 'Пожалуйста, выберите устройство для анализа.';
                return;
            }
    
            let url = '';
            const headers = {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            };
    
            if (selectedMethod === 'median') {
                url = `/iot_lk/api/analytics/median/?device_id=${deviceId}`;
            } else if (selectedMethod === 'mean') {
                url = `/iot_lk/api/analytics/arithmetic_mean/?device_id=${deviceId}`;
            } else if (selectedMethod === 'geom_mean') {
                url = `/iot_lk/api/analytics/geometric_mean/?device_id=${deviceId}`;
            } else if (selectedMethod === 'sq-mean') {
                url = `/iot_lk/api/analytics/root_mean_square/?device_id=${deviceId}`;
            } else if (selectedMethod === 'min') {
                url = `/iot_lk/api/analytics/min_value/?device_id=${deviceId}`;
            } else if (selectedMethod === 'max') {
                url = `/iot_lk/api/analytics/max_value/?device_id=${deviceId}`;
            } else if (selectedMethod === 'standard-dev') {
                url = `/iot_lk/api/analytics/standard_deviation/?device_id=${deviceId}`;
            } else if (selectedMethod === 'korr') {
                const secondDeviceId = secondDeviceSelect.value;
                if (!secondDeviceId) {
                    resultContainer.classList.add('reg__error-text');
                    resultContainer.textContent = 'Пожалуйста, выберите второе устройство для корреляции.';
                    return;
                }
                url = `/iot_lk/api/analytics/correlation_coefficient/?x_device_id=${deviceId}&y_device_id=${secondDeviceId}`;
            } else if (selectedMethod === 'regr') {
                const horizonValue = parseInt(timeInput.value, 10);
                if (!horizonValue || horizonValue > 30) {
                    resultContainer.classList.add('reg__error-text');
                    resultContainer.textContent = 'Введите корректное время предсказания (1-30 минут).';
                    return;
                }
                url = `/iot_lk/api/analytics/regression_analysis/?device_id=${deviceId}&horizon_value=${horizonValue}`;
            }
    
            fetch(url, { headers })
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    resultContainer.classList.add('reg__error-text');
                    resultContainer.textContent = `Ошибка анализа: ${data.error}`;
                } else {
                    resultContainer.classList.remove('reg__error-text');
                    resultContainer.textContent = `Результат анализа: ${JSON.stringify(data.result)}`;
                }
            })
            .catch(error => {
                resultContainer.classList.add('reg__error-text');
                resultContainer.textContent = `Ошибка при выполнении запроса: ${error.message}`;
            });
        }
        
        // const datasetBtns = querySelectorAll('.menu-datasets');
        // datasetBtns.forEach(btn => {
        //     btn.addEventListener("click", () => {
        //         return;
        //     });
        // });
        
    
    
        deviceSelect.addEventListener('change', performAnalysis);
        methodSelect.addEventListener('change', performAnalysis);
        secondDeviceSelect.addEventListener('change', performAnalysis);
        timeInput.addEventListener('input', performAnalysis);
    }    
    
    
    

    function showDeviceTable(mode) {
        const userId = Number(localStorage.getItem('userId'));
        const availableDatasets = JSON.parse(localStorage.getItem('availableDatasets'));
        const deviceTableBody = document.querySelector('.device-table tbody');
        const menuDevicesCard = document.getElementById('menu-devices-card');
        let allDeviceNames = [];
    
        if (!availableDatasets || availableDatasets.length === 0) {
            console.error('Нет доступных наборов данных.');
            return;
        }
    
        if (mode === 'table') {
            deviceTableBody.innerHTML = '';
        }
    
        if (mode === 'menu') {
            menuDevicesCard.innerHTML = '';
        }
    
        availableDatasets.forEach(dataset => {
            const datasetId = dataset.id;
    
            fetch(`https://iotdatahub.online/iot_lk/api/user/view_dataset_data?dataset_id=${datasetId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
            .then(response => response.json())
            .then(data => {
                const latestDevices = {};
    
                data.result.forEach(device => {
                    const deviceId = device.device_id;
                    const currentDate = parseDate(device.data_sending_date);
                    if (!latestDevices[deviceId] || currentDate > parseDate(latestDevices[deviceId].data_sending_date)) {
                        latestDevices[deviceId] = device;
                    }
                });
    
                Object.values(latestDevices).forEach(device => {
                    const deviceId = device.device_id;
                    const deviceModel = device.device_model ? device.device_model : `Устройство ${deviceId}`;
                    const parameterType = device.parameter_type;
                    const value = device.value;
                    const key = device.key;
    
                    const toggleKey = `<p class="toggle-text" style="cursor: pointer;">Нажмите сюда</p> 
                                       <p class="hidden-text" style="display: none;">${key}</p>`;
    
                    allDeviceNames.push(deviceModel);
    
                    if (mode === 'table') {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${datasetId}</td>
                            <td>${deviceId}</td>
                            <td>${deviceModel}</td>
                            <td>${parameterType}</td>
                            ${dataset.creator_id === userId ? `<td>${toggleKey}</td>` : '<td>Недоступно</td>'}
                            <td>${value}</td>
                        `;
                        deviceTableBody.appendChild(row);
                    }
    
                    if (mode === 'menu') {
                        const deviceLink = document.createElement('p');
                        deviceLink.classList.add('dropdown-item');
                        deviceLink.textContent = deviceModel;
                        menuDevicesCard.appendChild(deviceLink);
                    }
                });
    
                if (mode === "table") {
                    const toggleTexts = document.querySelectorAll('.toggle-text');
                    const hiddenTexts = document.querySelectorAll('.hidden-text');
    
                    toggleTexts.forEach((toggleText, index) => {
                        toggleText.addEventListener('click', function() {
                            const hiddenText = hiddenTexts[index];
                            if (hiddenText.style.display === 'none') {
                                hiddenText.style.display = 'block';
                                toggleText.style.display = 'none';
                            }
                        });
                    });
                }
    
            })
            .catch(error => {
                console.error('Ошибка при получении данных о наборе устройств:', error);
            });
        });
    
        localStorage.setItem('allDeviceNames', JSON.stringify(allDeviceNames));
    }
});
