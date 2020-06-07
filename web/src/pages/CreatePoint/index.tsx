import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import Dropzone from '../../components/Dropzone/index';
import { Link, useHistory } from 'react-router-dom';
import { Map, Marker, Popup, TileLayer } from 'react-leaflet';
import { FiArrowLeft } from 'react-icons/fi';
import axios from 'axios';
import api from '../../services/api';

import './styles.css';

import logo from '../../assets/logo.svg';
import { LeafletMouseEvent } from 'leaflet';

interface State {
  name: string;
  email: string;
  whatsapp: string;
  items?: [];
}

interface Item {
  id: number;
  image: string;
  title: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECityResponse {
  nome: string;
}

const CreatePoint = () => {
  const [formData, setFormData] = useState<State>({
    name: '',
    email: '',
    whatsapp: '',
  });

  const [position, setPosition] = useState<[number, number]>([0, 0]);
  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File>();
  const [selectedUf, setSelectedUf] = useState<string>('0');
  const [selectedCity, setSelectedCity] = useState<string>('0');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const history = useHistory();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setPosition([latitude, longitude]);
    });
  }, []);

  useEffect(() => {
    api.get('/items').then((response) => {
      setItems(response.data);
    });
  }, []);

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
      )
      .then((response) => {
        const ufsInitials = response.data.map((uf) => uf.sigla);
        setUfs(ufsInitials);
      });
  }, []);

  useEffect(() => {
    if (selectedUf === '0') return;

    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((response) => {
        const cityInitials = response.data.map((city) => city.nome);
        setCities(cityInitials);
      });
  }, [selectedUf]);

  const handleSelectPosition = (event: LeafletMouseEvent) => {
    setPosition([event.latlng.lat, event.latlng.lng]);
  };

  const handleSelectUf = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedUf(event.target.value);
  };

  const handleSelectCity = (event: ChangeEvent<HTMLSelectElement>) => {
    setSelectedCity(event.target.value);
  };

  const handleInputEvent = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSelectItem = (id: number) => {
    const pos = selectedItems.indexOf(id);

    if (pos >= 0) {
      setSelectedItems(selectedItems.filter((item) => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const [latitude, longitude] = position;
    const { name, email, whatsapp } = formData;

    const data = new FormData();

    data.append('name', name);
    data.append('email', email);
    data.append('whatsapp', whatsapp);
    data.append('latitude', String(latitude));
    data.append('longitude', String(longitude));
    data.append('uf', selectedUf);
    data.append('city', selectedCity);
    data.append('items', selectedItems.join(','));

    data.append('image', selectedFile ? selectedFile : 'null');

    await api.post('points', data);

    alert('Colect Point create success...');

    history.push('/');
  };

  return (
    <div id='page-create-point'>
      <header>
        <img src={logo} alt='Ecoleta' />
        <Link to='/'>
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br /> ponto de coleta
        </h1>

        <Dropzone onFileUploaded={setSelectedFile} />

        <fieldset>
          <legend>
            <h2>Dados da entidade</h2>
          </legend>

          <div className='field'>
            <label htmlFor='name'>Nome da Entidade</label>
            <input
              type='text'
              name='name'
              id='name'
              value={formData.name}
              onChange={handleInputEvent}
            />
          </div>

          <div className='field-group'>
            <div className='field'>
              <label htmlFor='email'>E-mail</label>
              <input
                type='email'
                name='email'
                id='email'
                value={formData.email}
                onChange={handleInputEvent}
              />
            </div>

            <div className='field'>
              <label htmlFor='whatsapp'>Whatsapp</label>
              <input
                type='number'
                name='whatsapp'
                id='whatsapp'
                value={formData.whatsapp}
                onChange={handleInputEvent}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço de coleta</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={position} zoom={15} onClick={handleSelectPosition}>
            <TileLayer
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
              <Popup>Casa do meu sogro.</Popup>
            </Marker>
          </Map>

          <div className='field-group'>
            <div className='field'>
              <label htmlFor='uf'>Estado</label>
              <select name='uf' id='uf' onChange={handleSelectUf}>
                <option value='0'>Selecione um Estado</option>
                {ufs.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className='field'>
              <label htmlFor='city'>Cidade</label>
              <select
                name='city'
                id='city'
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value='0'>Selecione uma Cidade</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Itens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>
          <ul className='items-grid'>
            {items.map((item) => (
              <li
                key={item.id}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
                onClick={() => handleSelectItem(item.id)}
              >
                <img src={item.image} alt={item.title} />
                <span>Lâmpadas</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type='submit'>Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
