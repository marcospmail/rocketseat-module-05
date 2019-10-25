import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import api from '../../services/api';

import Container from '../components/Container';
import { Loading, Owner, IssuesFilter, IssueList } from './styles';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    issuesFilter: 'all',
  };

  async componentDidMount() {
    const { match } = this.props;

    const { issuesFilter } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'open',
          per_page: 5,
        },
        query: {
          state: issuesFilter,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  onIssuesFilterSelected = async value => {
    this.setState({
      issuesFilter: value,
    });
    // const { repository } = this.state;
    // const repoName = repository.name;

    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: value,
        per_page: 5,
      },
    });

    this.setState({
      issues: issues.data,
      loading: false,
    });
  };

  render() {
    const { repository, issues, loading } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <IssueList>
          <DropdownButton
            id="dropdown-basic-button"
            title="Dropdown button"
            onSelect={this.onIssuesFilterSelected}
          >
            <Dropdown.Item eventKey="all">Todos</Dropdown.Item>
            <Dropdown.Item eventKey="open">Abertos</Dropdown.Item>
            <Dropdown.Item eventKey="closed">Fechados</Dropdown.Item>
          </DropdownButton>

          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
      </Container>
    );
  }
}
