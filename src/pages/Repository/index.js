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
  Paginator,
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
    filterIndex: 0,
    page: 1,
    loading: true,
    loadingIssues: false,
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
    const [repository, issues] = await Promise.all([
      this.getRepositoryData(),
      this.getIssuesData(),
    ]);

    this.setState({
      loading: false,
      repository: repository.data,
      issues: issues.data,
    });
  }

  getRepositoryData = () => {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);

    return api.get(`/repos/${repoName}`);
  };

  getIssuesData = async () => {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);
    const { filterIndex, issuesFilter, page } = this.state;

    return api.get(`/repos/${repoName}/issues`, {
      params: {
        state: issuesFilter[filterIndex].value,
        per_page: 5,
        page,
      },
    });
  };

  loadIssues = async () => {
    this.setState({ loadingIssues: true });
    const issues = await this.getIssuesData();

    this.setState({
      issues: issues.data,
      loadingIssues: false,
    });
  };

  handleIssueFilterChange = filterIndex => {
    this.setState({
      filterIndex,
      page: 1,
    });

    this.loadIssues();
  };

  handlePageChange(page) {
    this.setState({ page, loadingIssues: true });

    this.loadIssues();
  }

  render() {
    const {
      repository,
      issues,
      loading,
      issuesFilter,
      filterIndex,
      loadingIssues,
      page = 1,
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
                onClick={() => this.handleIssueFilterChange(index)}
              >
                {filter.name}
              </button>
            ))}
          </IssueFilter>

          {loadingIssues ? (
            <LoadingIssues loadingIssues={loadingIssues ? 1 : 0}>
              <FaSpinner size={20} />
            </LoadingIssues>
          ) : (
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
            ))
          )}

          <Paginator>
            <button
              type="button"
              disabled={page === 1}
              onClick={() => this.handlePageChange(page - 1)}
            >
              Anterior
            </button>
            <span>{page}</span>
            <button
              type="button"
              onClick={() => this.handlePageChange(page + 1)}
            >
              Próxima
            </button>
          </Paginator>
        </IssueList>
      </Container>
    );
  }
}
