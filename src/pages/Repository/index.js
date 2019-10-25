import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import api from '../../services/api';

import Container from '../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  IssueFilter,
  LoadingIssues,
} from './styles';

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
    loadingIssues: false,
    filterIndex: 0,
    issuesFilter: [
      {
        name: 'Todos',
        value: 'all',
      },
      {
        name: 'Abertos',
        value: 'open',
      },
      {
        name: 'Fechados',
        value: 'closed',
      },
    ],
  };

  async componentDidMount() {
    this.loadIssues();
  }

  loadIssues = async () => {
    this.setState({ loadingIssues: true });

    const { match } = this.props;

    const repoName = decodeURIComponent(match.params.repository);

    const { filterIndex, issuesFilter } = this.state;

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issuesFilter[filterIndex].value,
          per_page: 5,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
      loadingIssues: false,
    });
  };

  onIssuesFilterSelected = filterIndex => {
    this.setState({
      filterIndex,
    });

    this.loadIssues();
  };

  render() {
    const {
      repository,
      issues,
      loading,
      issuesFilter,
      filterIndex,
      loadingIssues,
    } = this.state;

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
          <IssueFilter activeIndex={filterIndex + 1}>
            {issuesFilter.map((filter, index) => (
              <button
                disabled={index === filterIndex}
                key={filter.value}
                type="button"
                onClick={() => this.onIssuesFilterSelected(index)}
              >
                {filter.name}
              </button>
            ))}
          </IssueFilter>

          {loadingIssues && (
            <LoadingIssues loadingIssues={loadingIssues ? 1 : 0}>
              <FaSpinner size={20} />
            </LoadingIssues>
          )}

          {!loadingIssues &&
            issues.map(issue => (
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
