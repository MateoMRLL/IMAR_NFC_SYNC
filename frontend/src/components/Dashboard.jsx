import { Clock, FileText, Hash, Mail, Tag, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_URL } from "../config";
import "./Dashboard.css";
const baseUrl = API_URL;

console.log(API_URL);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [tags, setTags] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch générique pour récupérer uniquement la partie "cloud" d'un endpoint
  const fetchCloudData = async (endpoint, setter) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${baseUrl}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      // On prend uniquement la partie cloud
      setter(result.data?.cloud || []);
    } catch (err) {
      setError(err.message);
      setter([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async (setter) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/api/nfc/logs`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      setter((result.data?.cloud || []).filter(log => log.name));
    } catch (err) {
      setError(err.message);
      setter([]);
    } finally {
      setIsLoading(false);
    }
  };



  // Fetch automatique au chargement de la page selon l’onglet actif
  useEffect(() => {
    console.log("Active tab:", activeTab);
    switch (activeTab) {
      case 'users':
        fetchCloudData('/api/users', data => { console.log("Users:", data); setUsers(data); });
        break;
      case 'tags':
        fetchCloudData('/api/tags', data => { console.log("Tags:", data); setTags(data); });
        break;
      case 'logs':
        fetchLogs(data => { console.log("Logs:", data); setLogs(data); });
        break;
    }
  }, [activeTab]);


  // Composants pour les cartes
  const UserCard = ({ user }) => (
    <div className="card">
      <div className="card-header">
        <Users className="icon blue" size={24} />
        <h3 className="card-title">{user.name}</h3>
      </div>
      <div className="card-body">
        <div className="card-row">
          <Mail className="icon gray" size={16} />
          <span>{user.email}</span>
        </div>
        <div className="card-row">
          <Clock className="icon gray" size={16} />
          <span>Created at : {user.created_at}</span>
        </div>
      </div>
    </div>
  );

  const TagCard = ({ tag }) => (
    <div className="card">
      <div className="card-header">
        <Tag className="icon green" size={24} />
        <h3 className="card-title">{tag.uid}</h3>
      </div>
      <div className="card-row">
        <Clock className="icon gray" size={16} />
        <span>Created at : {tag.created_at}</span>
      </div>
    </div>
  );

  const LogCard = ({ log }) => (
    <div className="card">
      <div className="card-header">
        <FileText className="icon purple" size={24} />
        <h3 className="card-title">Scan </h3>
      </div>
      <div className="card-body">
        <div className="card-row">
          <Hash className="icon gray" size={16} />
          <span> Tag ID :{log.tag_id}</span>
        </div>
        <div className="card-row">
          <Hash className="icon gray" size={16} />
          <span>User Name : {log.name}</span>
        </div>
        <div className="card-row">
          <Clock className="icon gray" size={16} />
          <span>Scanned at: {log.scanned_at}</span>
        </div>
      </div>
    </div>
  );

  // Bouton pour onglets
  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`tab-button ${isActive ? 'active' : ''}`}
    >
      <Icon size={20} className="icon" />
      {label}
    </button>
  );

  // Rendu du contenu selon l’onglet actif
  const renderContent = () => {
    if (isLoading) return <p>Loading...</p>;
    if (error) return <p className="error">Error: {error}</p>;

    switch (activeTab) {
      case 'users':
        return (
          <div className="section">
            <div className="section-header"><h2>Users</h2></div>
            <div className="grid">
              {users.map(user => <UserCard key={user.id} user={user} />)}
            </div>
          </div>
        );
      case 'tags':
        return (
          <div className="section">
            <div className="section-header"><h2>Tags</h2></div>
            <div className="grid">
              {tags.map(tag => <TagCard key={tag.id} tag={tag} />)}
            </div>
          </div>
        );
      case 'logs':
        return (
          <div className="section">
            <div className="section-header"><h2>Logs</h2></div>
            <div className="grid">
              {logs.map(log => <LogCard key={log.id} log={log} />)}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Overview of the database</p>
        </header>

        <nav className="tabs">
          <TabButton
            id="users"
            label="Users"
            icon={Users}
            isActive={activeTab === 'users'}
            onClick={setActiveTab}
          />
          <TabButton
            id="tags"
            label="Tags"
            icon={Tag}
            isActive={activeTab === 'tags'}
            onClick={setActiveTab}
          />
          <TabButton
            id="logs"
            label="Logs"
            icon={FileText}
            isActive={activeTab === 'logs'}
            onClick={setActiveTab}
          />
        </nav>

        <main className="content">{renderContent()}</main>
      </div>
    </div>
  );
};

export default Dashboard;
